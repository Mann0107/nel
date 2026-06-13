const http = require('http');

const PORT = 5001;
const BASE_URL = `http://localhost:${PORT}`;

// Helper function to make HTTP requests
const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = data ? JSON.parse(data) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData,
          });
        } catch (err) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            rawData: data,
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
};

const runTests = async () => {
  console.log('=== STARTING NEEL INDIA API INTEGRATION TESTS ===\n');
  
  let userToken = '';
  let adminToken = '';
  let testProductId = '';
  let addressId = '';
  let mockOrderId = '';
  let activeOrderDocId = ''; // mongodb _id of order

  try {
    // 1. Test Auth: Login Customer
    console.log('Test 1: Logging in default customer...');
    const userLoginRes = await request('POST', '/api/auth/login', {
      loginId: 'user@neel.in',
      password: 'userpassword',
    });

    if (userLoginRes.statusCode === 200) {
      console.log('  [PASS] Customer login successful.');
      userToken = userLoginRes.data.token;
    } else {
      console.log(`  [FAIL] Customer login failed (Status: ${userLoginRes.statusCode}):`, userLoginRes.data.message);
    }

    // 2. Test Auth: Login Admin
    console.log('\nTest 2: Logging in default admin...');
    const adminLoginRes = await request('POST', '/api/auth/login', {
      loginId: 'admin@neel.in',
      password: 'adminpassword',
    });

    if (adminLoginRes.statusCode === 200) {
      console.log('  [PASS] Admin login successful.');
      adminToken = adminLoginRes.data.token;
    } else {
      console.log(`  [FAIL] Admin login failed (Status: ${adminLoginRes.statusCode}):`, adminLoginRes.data.message);
    }

    // 3. Test Products: Get all products
    console.log('\nTest 3: Fetching products...');
    const productsRes = await request('GET', '/api/products');
    if (productsRes.statusCode === 200 && productsRes.data.products?.length > 0) {
      console.log(`  [PASS] Found ${productsRes.data.products.length} products.`);
      testProductId = productsRes.data.products[0]._id;
    } else {
      console.log('  [FAIL] Failed to fetch products or none seeded.');
    }

    // 4. Test Pincode: Check serviceable pincode
    console.log('\nTest 4: Checking serviceable pincode 400001 (Mumbai)...');
    const pinCheckRes = await request('GET', '/api/pincodes/check/400001');
    if (pinCheckRes.statusCode === 200 && pinCheckRes.data.serviceable) {
      console.log('  [PASS] Pincode is deliverable. Charge:', pinCheckRes.data.deliveryCharge);
    } else {
      console.log('  [FAIL] Serviceable pincode check returned false or error.');
    }

    // 5. Test Pincode: Check unserviceable pincode
    console.log('\nTest 5: Checking unserviceable pincode 110092...');
    const pinCheckFailRes = await request('GET', '/api/pincodes/check/110092');
    if (pinCheckFailRes.statusCode === 200 && !pinCheckFailRes.data.serviceable) {
      console.log('  [PASS] Correctly blocked delivery to unserviceable pincode.');
    } else {
      console.log('  [FAIL] Unserviceable pincode check failed to block.');
    }

    // 6. Test Address: Add Address
    console.log('\nTest 6: Adding shipping address...');
    const addAddressRes = await request('POST', '/api/orders/addresses', {
      fullName: 'Rajesh Patel',
      mobile: '9123456789',
      houseNo: 'Flat 402, Block C',
      streetAddress: 'Link Road',
      area: 'Andheri West',
      city: 'Mumbai',
      district: 'Mumbai Suburban',
      state: 'Maharashtra',
      pincode: '400001',
      landmark: 'Near Metro Station',
      isDefault: true,
    }, userToken);

    if (addAddressRes.statusCode === 201) {
      console.log('  [PASS] Address created.');
      addressId = addAddressRes.data._id;
    } else {
      console.log('  [FAIL] Address creation failed:', addAddressRes.data.message);
    }

    // 7. Test Cart: Add item to cart
    console.log('\nTest 7: Adding product to cart...');
    const addToCartRes = await request('POST', '/api/cart/add', {
      productId: testProductId,
      size: 'L',
      quantity: 2,
    }, userToken);

    if (addToCartRes.statusCode === 200) {
      console.log('  [PASS] Added product to cart. Cart size:', addToCartRes.data.items.length);
    } else {
      console.log('  [FAIL] Cart add failed:', addToCartRes.data.message);
    }

    // 8. Test Checkout: Create payment order
    console.log('\nTest 8: Creating payment order...');
    const createPayOrderRes = await request('POST', '/api/orders/create-payment-order', {
      addressId,
    }, userToken);

    if (createPayOrderRes.statusCode === 200) {
      console.log('  [PASS] Payment order created successfully. Grand Total:', createPayOrderRes.data.grandTotal);
      mockOrderId = createPayOrderRes.data.orderId;
    } else {
      console.log('  [FAIL] Payment order creation failed:', createPayOrderRes.data.message);
    }

    // 9. Test Checkout: Verify payment & place order
    console.log('\nTest 9: Verifying payment (mock signature)...');
    const verifyPayRes = await request('POST', '/api/orders/verify-payment', {
      orderId: mockOrderId, // mock order id
      razorpay_payment_id: 'pay_mock_123456789',
      razorpay_signature: 'mock_signature_abc123',
      addressId,
    }, userToken);

    if (verifyPayRes.statusCode === 201) {
      console.log('  [PASS] Payment verified and Order placed! Invoice No:', verifyPayRes.data.invoiceNumber);
      activeOrderDocId = verifyPayRes.data._id;
    } else {
      console.log('  [FAIL] Payment verification / Order placement failed:', verifyPayRes.data.message);
    }

    // 10. Test Orders: Get customer orders
    console.log('\nTest 10: Fetching customer orders...');
    const myOrdersRes = await request('GET', '/api/orders/my-orders', null, userToken);
    if (myOrdersRes.statusCode === 200 && myOrdersRes.data.length > 0) {
      console.log(`  [PASS] Retrieved ${myOrdersRes.data.length} customer orders.`);
    } else {
      console.log('  [FAIL] Failed to retrieve orders.');
    }

    // 11. Test Admin: Update order status to "Accepted"
    console.log('\nTest 11: Updating order status (Admin)...');
    const updateStatusRes = await request('PUT', `/api/admin/orders/${activeOrderDocId}/status`, {
      status: 'Accepted',
      courierPartner: 'Delhivery',
      trackingId: 'DLV987654321',
    }, adminToken);

    if (updateStatusRes.statusCode === 200 && updateStatusRes.data.status === 'Accepted') {
      console.log('  [PASS] Order status successfully updated to Accepted with tracking.');
    } else {
      console.log('  [FAIL] Failed to update order status:', updateStatusRes.data.message);
    }

    // 12. Test Admin: Fetch dashboard stats
    console.log('\nTest 12: Fetching Admin Dashboard metrics...');
    const statsRes = await request('GET', '/api/admin/dashboard-stats', null, adminToken);
    if (statsRes.statusCode === 200) {
      console.log(`  [PASS] Stats fetched. Total Sales: Rs. ${statsRes.data.totalSales}, Total Orders: ${statsRes.data.totalOrders}`);
    } else {
      console.log('  [FAIL] Failed to fetch admin stats:', statsRes.data.message);
    }

    console.log('\n=== ALL TESTS EXECUTED COMPLETED ===');
  } catch (error) {
    console.error('\n[FATAL ERROR IN TEST SCRIPT]:', error);
  }
};

// Only execute if run directly
if (require.main === module) {
  runTests();
}
