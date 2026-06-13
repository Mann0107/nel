const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Pincode = require('../models/Pincode');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Notification = require('../models/Notification');

dotenv.config({ path: '../.env' }); // load from parent relative or local

const seedData = async (shouldCloseConnection = true) => {
  try {
    if (mongoose.connection.readyState === 0) {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fashionkart';
      await mongoose.connect(mongoUri);
      console.log('Seeder connected to MongoDB...');
    }

    // Clear DB
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await Pincode.deleteMany();
    await Cart.deleteMany();
    await Wishlist.deleteMany();
    await Order.deleteMany();
    await Review.deleteMany();
    await Notification.deleteMany();

    console.log('Database cleared.');

    // 1. Seed Users
    const adminUser = await User.create({
      name: 'Aditi Sharma (Admin)',
      email: 'admin@neel.in',
      mobile: '9876543210',
      password: 'adminpassword',
      role: 'admin',
    });

    const regularUser = await User.create({
      name: 'Rajesh Patel',
      email: 'user@neel.in',
      mobile: '9123456789',
      password: 'userpassword',
      role: 'customer',
    });

    // Create Cart and Wishlist for regular user
    await Cart.create({ user: regularUser._id, items: [] });
    await Wishlist.create({ user: regularUser._id, products: [] });

    console.log('Users seeded successfully.');

    // 2. Seed Pincodes
    const pincodes = [
      { pincode: '360001', serviceable: true, deliveryCharge: 50, estDays: 3 },
      { pincode: '360002', serviceable: true, deliveryCharge: 50, estDays: 3 },
      { pincode: '361001', serviceable: true, deliveryCharge: 60, estDays: 4 },
      { pincode: '361004', serviceable: true, deliveryCharge: 60, estDays: 4 },
      { pincode: '400001', serviceable: true, deliveryCharge: 40, estDays: 2 }, // Mumbai
      { pincode: '110001', serviceable: true, deliveryCharge: 80, estDays: 5 }, // Delhi
      { pincode: '560001', serviceable: true, deliveryCharge: 70, estDays: 4 }, // Bangalore
      { pincode: '110092', serviceable: false, deliveryCharge: 0, estDays: 0 }, // Unserviceable
    ];
    await Pincode.insertMany(pincodes);
    console.log('Pincodes seeded.');

    // 3. Seed Categories
    const categories = [
      { name: 'Saree', slug: 'saree', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500' },
      { name: 'Kurti', slug: 'kurti', image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=500' },
      { name: 'Salwar Suit', slug: 'salwar-suit', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500' },
      { name: 'Lehenga', slug: 'lehenga', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500' },
      { name: 'Western Dress', slug: 'western-dress', image: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=500' },
      { name: 'Party Wear', slug: 'party-wear', image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=500' },
      { name: 'Men\'s Wear', slug: 'mens-wear', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500' },
      { name: 'Kids Wear', slug: 'kids-wear', image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=500' },
    ];
    await Category.insertMany(categories);
    console.log('Categories seeded.');

    // 4. Seed Products
    const products = [
      {
        name: 'Royal Banarasi Silk Saree',
        code: 'SAREE-BANARASI-01',
        brand: 'Varanasi Weaves',
        category: 'Saree',
        originalPrice: 4999,
        discountPercentage: 20,
        description: {
          fabric: 'Katan Banarasi Silk',
          material: 'Pure Silk with Zari Threads',
          quality: 'Premium Handloom',
          weight: '800 grams',
          color: 'Crimson Red & Gold',
          design: 'Floral Jaal Motif',
          pattern: 'Traditional Brocade',
          sleeveType: 'Unstitched Blouse Piece included',
          neckType: 'Varies by stitching',
          occasion: 'Wedding / Festive Wear',
          washCare: 'Dry Clean Only',
        },
        sizes: ['M', 'L', 'XL'],
        stock: 15,
        images: [
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800',
          'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800',
        ],
        averageRating: 4.8,
        numReviews: 1,
      },
      {
        name: 'Elegant Anarkali Georgette Kurti',
        code: 'KURTI-ANARKALI-02',
        brand: 'Jaipur Shringar',
        category: 'Kurti',
        originalPrice: 2499,
        discountPercentage: 15,
        description: {
          fabric: 'Faux Georgette',
          material: 'Georgette with Crepe Inner Lining',
          quality: 'Soft Touch Premium Stitching',
          weight: '450 grams',
          color: 'Emerald Green',
          design: 'Gotapatti Lace Border',
          pattern: 'Solid Flaired Anarkali',
          sleeveType: '3/4th Sleeve',
          neckType: 'Round Neck',
          occasion: 'Formal / Festive Wear',
          washCare: 'Hand Wash Cold',
        },
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        stock: 25,
        images: [
          'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800',
          'https://images.unsplash.com/photo-1608748010899-18f300247112?w=800',
        ],
        averageRating: 4.5,
        numReviews: 1,
      },
      {
        name: 'Traditional Punjabi Salwar Suit',
        code: 'SUIT-PUNJABI-03',
        brand: 'Patiala Express',
        category: 'Salwar Suit',
        originalPrice: 1999,
        discountPercentage: 10,
        description: {
          fabric: 'Pure Cotton',
          material: 'Glazed Cotton Top with Santoon Bottom',
          quality: 'Super Breathable Daily Wear',
          weight: '600 grams',
          color: 'Mustard Yellow & Black Phulkari',
          design: 'Phulkari Hand Embroidery',
          pattern: 'Printed Bottom with Embroidered Top',
          sleeveType: 'Full Sleeve',
          neckType: 'Keyhole Neck',
          occasion: 'Daily / Casual wear',
          washCare: 'Machine Wash Gentle Cycle',
        },
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        stock: 30,
        images: [
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800',
        ],
        averageRating: 4.2,
        numReviews: 1,
      },
      {
        name: 'Bridal Floral Velvet Lehenga',
        code: 'LEHENGA-VELVET-04',
        brand: 'Sabyasachi Dreams',
        category: 'Lehenga',
        originalPrice: 14999,
        discountPercentage: 25,
        description: {
          fabric: 'Heavy Velvet',
          material: 'Velvet Lehenga and Blouse, Net Dupatta',
          quality: 'Masterpiece Heavy Zardozi Embroidery',
          weight: '2.5 kg',
          color: 'Deep Maroon',
          design: 'Dori, Zari and Sequins Work',
          pattern: 'Panelled Lehenga (Kalidar)',
          sleeveType: 'Half Sleeve',
          neckType: 'Sweetheart Neck',
          occasion: 'Bridal / Reception Wear',
          washCare: 'Professional Dry Clean Only',
        },
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 5,
        images: [
          'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
          'https://images.unsplash.com/photo-1610030470298-40523feaa3c1?w=800',
        ],
        averageRating: 5.0,
        numReviews: 1,
      },
      {
        name: 'Indo-Western Georgette Maxi Dress',
        code: 'WESTERN-MAXI-05',
        brand: 'Indya Fusion',
        category: 'Western Dress',
        originalPrice: 3299,
        discountPercentage: 30,
        description: {
          fabric: 'Georgette with Foil Print',
          material: 'Polyester Georgette',
          quality: 'Modern Indo-Western Silhouette',
          weight: '500 grams',
          color: 'Navy Blue & Rose Gold',
          design: 'Foil Print Ethnic Motif',
          pattern: 'Cape Sleeve Tiered Maxi',
          sleeveType: 'Cape Style Sleeve',
          neckType: 'Boat Neck',
          occasion: 'Cocktail / Evening Party',
          washCare: 'Dry Clean or Cold Handwash',
        },
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 12,
        images: [
          'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=800',
        ],
        averageRating: 4.4,
        numReviews: 1,
      },
      {
        name: 'Glamorous Sequinned Party Wear Dress',
        code: 'PARTY-SEQUIN-06',
        brand: 'Zara Fashion Hub',
        category: 'Party Wear',
        originalPrice: 4500,
        discountPercentage: 20,
        description: {
          fabric: 'Polyester Blend with Micro Sequins',
          material: 'Polyester Lycra Knit base',
          quality: 'Highly Stretchable Bodycon',
          weight: '650 grams',
          color: 'Midnight Onyx Black',
          design: 'Shimmering All-over Sequins',
          pattern: 'Cocktail Slit Bodycon',
          sleeveType: 'Sleeveless',
          neckType: 'Cowl Neck',
          occasion: 'Club / Evening Party',
          washCare: 'Hand Wash Inside Out',
        },
        sizes: ['XS', 'S', 'M', 'L'],
        stock: 8,
        images: [
          'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800',
        ],
        averageRating: 4.6,
        numReviews: 1,
      },
      {
        name: 'Ethnic Cotton Nehru Jacket Kurta Set',
        code: 'MEN-KURTA-07',
        brand: 'Manyavar Heritage',
        category: 'Men\'s Wear',
        originalPrice: 3999,
        discountPercentage: 10,
        description: {
          fabric: 'Cotton Linen Blend',
          material: 'Khadi Cotton Kurta Pyjama, Jacquard Silk Jacket',
          quality: 'Premium Fitting Traditional Set',
          weight: '700 grams',
          color: 'Cream Kurta and Bottom, Peach Jacket',
          design: 'Jacquard Floral Weave Jacket',
          pattern: 'Straight Kurta Set with Pocket Square',
          sleeveType: 'Full Sleeve',
          neckType: 'Mandarin Collar',
          occasion: 'Festival / Wedding Puja',
          washCare: 'Dry Clean Recommended',
        },
        sizes: ['M', 'L', 'XL', 'XXL'],
        stock: 10,
        images: [
          'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
        ],
        averageRating: 4.7,
        numReviews: 1,
      },
      {
        name: 'Lehenga Choli for Girls',
        code: 'KIDS-LEHENGA-08',
        brand: 'Nishi Kids',
        category: 'Kids Wear',
        originalPrice: 1499,
        discountPercentage: 15,
        description: {
          fabric: 'Soft Net and Satin',
          material: 'Satin Blouse, Net Lehenga, Inner Cotton Lining',
          quality: 'Skin Friendly Kid Safe Fabric',
          weight: '300 grams',
          color: 'Baby Pink & Silver',
          design: 'Silver Foil Stars and Sequins border',
          pattern: 'Pre-stitched elasticized waistband',
          sleeveType: 'Short Puff Sleeve',
          neckType: 'Round Neck',
          occasion: 'Kids Birthday / Diwali Party',
          washCare: 'Hand Wash Cold',
        },
        sizes: ['S', 'M', 'L'],
        stock: 20,
        images: [
          'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800',
        ],
        averageRating: 4.3,
        numReviews: 1,
      },
    ];

    const insertedProducts = [];
    for (const pData of products) {
      const p = await Product.create(pData);
      insertedProducts.push(p);
    }
    console.log('Products seeded.');

    // 5. Seed Reviews
    for (const prod of insertedProducts) {
      await Review.create({
        user: regularUser._id,
        userName: regularUser.name,
        product: prod._id,
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 rating
        comment: `Excellent quality. The ${prod.description.fabric} fabric feels super premium! Highly recommended purchase.`,
      });
    }

    console.log('Reviews seeded, product average ratings adjusted.');

    if (shouldCloseConnection) {
      console.log('Database Seeding Successful! Closing connection.');
      await mongoose.connection.close();
    } else {
      console.log('Database Seeding Successful! Connection kept open.');
    }
  } catch (error) {
    console.error('Seeder Error:', error);
    if (shouldCloseConnection) process.exit(1);
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
