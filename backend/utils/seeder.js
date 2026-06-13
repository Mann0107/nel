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
        images: ['/images/products/saree_banarasi.png'],
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
        images: ['/images/products/kurti_anarkali.png'],
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
        images: ['/images/products/salwar_suit.png'],
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
        images: ['/images/products/lehenga_velvet.png'],
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
        images: ['/images/products/western_dress.png'],
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
        images: ['/images/products/party_wear.png'],
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
        images: ['/images/products/mens_wear.png'],
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
        images: ['/images/products/kids_wear.png'],
        averageRating: 4.3,
        numReviews: 1,
      },
      {
        name: 'Kanjeevaram Kora Silk Saree',
        code: 'SAREE-KANJEEVARAM-09',
        brand: 'Kanchi Weavers',
        category: 'Saree',
        originalPrice: 6999,
        discountPercentage: 15,
        description: {
          fabric: 'Kanjeevaram Silk',
          material: 'Silk with Silver Zari Weaving',
          quality: 'Premium Handwoven Traditional',
          weight: '750 grams',
          color: 'Royal Blue & Magenta Pink',
          design: 'Temple Border Motif',
          pattern: 'Traditional Zari Border',
          sleeveType: 'Unstitched Blouse Piece included',
          neckType: 'Customizable',
          occasion: 'Wedding / Festive Wear',
          washCare: 'Dry Clean Only',
        },
        sizes: ['M', 'L', 'XL'],
        stock: 18,
        images: ['/images/products/saree_kanjeevaram.png'],
        averageRating: 4.9,
        numReviews: 1,
      },
      {
        name: 'Lavender Georgette Sharara Suit',
        code: 'SUIT-SHARARA-10',
        brand: 'Jaipur Shringar',
        category: 'Salwar Suit',
        originalPrice: 3499,
        discountPercentage: 20,
        description: {
          fabric: 'Georgette',
          material: 'Faux Georgette Top, Sharara, and Net Dupatta',
          quality: 'Mirror Work and Gota Border Accent',
          weight: '680 grams',
          color: 'Pastel Lavender',
          design: 'Floral Print with Mirror Trim',
          pattern: 'Fully Stitched Flared Sharara Set',
          sleeveType: 'Short Sleeve',
          neckType: 'U-Neck',
          occasion: 'Puja / Mehendi Wear',
          washCare: 'Dry Clean Recommended',
        },
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 14,
        images: ['/images/products/suit_sharara.png'],
        averageRating: 4.6,
        numReviews: 1,
      },
      {
        name: 'Premium Banarasi Silk Saree',
        code: 'SAREE-BANARASI-11',
        brand: 'Varanasi Weaves',
        category: 'Saree',
        originalPrice: 5499,
        discountPercentage: 10,
        description: {
          fabric: 'Katan Banarasi Silk',
          material: 'Pure Silk with Zari threads',
          quality: 'High-density Weaving',
          weight: '820 grams',
          color: 'Golden Crimson Red',
          design: 'Jaal Motifs',
          pattern: 'Brocade Traditional',
          sleeveType: 'Unstitched Blouse included',
          neckType: 'Stitched customized',
          occasion: 'Festive Wear',
          washCare: 'Dry Clean Only',
        },
        sizes: ['M', 'L', 'XL'],
        stock: 12,
        images: ['/images/products/saree_banarasi.png'],
        averageRating: 4.7,
        numReviews: 1,
      },
      {
        name: 'Summer Cotton Anarkali Kurti',
        code: 'KURTI-ANARKALI-12',
        brand: 'Jaipur Shringar',
        category: 'Kurti',
        originalPrice: 1899,
        discountPercentage: 25,
        description: {
          fabric: '100% Pure Cotton',
          material: 'Breathable Mulmul Cotton',
          quality: 'Everyday Comfort Wear',
          weight: '350 grams',
          color: 'Mint Green and White',
          design: 'Handblock Jaipur Print',
          pattern: 'Kalidar Anarkali Flared',
          sleeveType: '3/4th Sleeve',
          neckType: 'Round Neck',
          occasion: 'Casual Daily wear',
          washCare: 'Machine Wash Gentles',
        },
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        stock: 40,
        images: ['/images/products/kurti_anarkali.png'],
        averageRating: 4.4,
        numReviews: 1,
      },
      {
        name: 'Embroidered Daily Wear Salwar Suit',
        code: 'SUIT-EMBROIDERED-13',
        brand: 'Patiala Express',
        category: 'Salwar Suit',
        originalPrice: 2200,
        discountPercentage: 15,
        description: {
          fabric: 'Pure Cotton',
          material: 'Cotton Kameez, Cotton Salwar, Chiffon Dupatta',
          quality: 'Neckline Thread Embroidery',
          weight: '580 grams',
          color: 'Turquoise and Yellow',
          design: 'Neck Embroidery Motif',
          pattern: 'Straight Cut Suit Set',
          sleeveType: '3/4th Sleeve',
          neckType: 'Sweetheart Neck',
          occasion: 'Office / Daily wear',
          washCare: 'Hand Wash Cold',
        },
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        stock: 22,
        images: ['/images/products/salwar_suit.png'],
        averageRating: 4.3,
        numReviews: 1,
      },
      {
        name: 'Handcrafted Velvet Lehenga Choli',
        code: 'LEHENGA-VELVET-14',
        brand: 'Sabyasachi Dreams',
        category: 'Lehenga',
        originalPrice: 15999,
        discountPercentage: 18,
        description: {
          fabric: 'Premium Heavy Velvet',
          material: 'Velvet Lehenga, Silk Blouse, Net Dupatta',
          quality: 'Zardozi Handwork detailing',
          weight: '2.6 kg',
          color: 'Deep Plum Maroon',
          design: 'Zari and Dori Embroidery',
          pattern: 'Kalidar Lehenga',
          sleeveType: 'Half Sleeve',
          neckType: 'V-neck',
          occasion: 'Bridal / Wedding Wear',
          washCare: 'Professional Dry Clean Only',
        },
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 6,
        images: ['/images/products/lehenga_velvet.png'],
        averageRating: 4.8,
        numReviews: 1,
      },
      {
        name: 'Tiered Georgette Indo-Western Dress',
        code: 'WESTERN-MAXI-15',
        brand: 'Indya Fusion',
        category: 'Western Dress',
        originalPrice: 2999,
        discountPercentage: 20,
        description: {
          fabric: 'Georgette',
          material: 'Polyester Georgette lining included',
          quality: 'Gently Flared Tiered Hemline',
          weight: '480 grams',
          color: 'Teal Blue with Foil print',
          design: 'Gold Foil Border detailing',
          pattern: 'Tiered Indo-Western Silhouette',
          sleeveType: 'Sleeveless with Straps',
          neckType: 'Square Neck',
          occasion: 'Festive Gathering / Party',
          washCare: 'Dry Clean Only',
        },
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 15,
        images: ['/images/products/western_dress.png'],
        averageRating: 4.5,
        numReviews: 1,
      },
      {
        name: 'Sequinned Cowl Neck Cocktail Dress',
        code: 'PARTY-SEQUIN-16',
        brand: 'Zara Fashion Hub',
        category: 'Party Wear',
        originalPrice: 4999,
        discountPercentage: 15,
        description: {
          fabric: 'Sequinned Stretch Polyester',
          material: 'Polyester Lycra Blend',
          quality: 'Glimmering Micro-sequin fabric',
          weight: '620 grams',
          color: 'Deep Wine Burgundy',
          design: 'Cowl Neck Side Slit design',
          pattern: 'Bodycon Cocktail wear',
          sleeveType: 'Sleeveless with Spaghetti Straps',
          neckType: 'Cowl Neck',
          occasion: 'Evening Party / Club',
          washCare: 'Hand Wash inside out',
        },
        sizes: ['XS', 'S', 'M', 'L'],
        stock: 11,
        images: ['/images/products/party_wear.png'],
        averageRating: 4.6,
        numReviews: 1,
      },
      {
        name: 'Jacquard Silk Kurta Nehru Jacket Set',
        code: 'MEN-KURTA-17',
        brand: 'Manyavar Heritage',
        category: 'Men\'s Wear',
        originalPrice: 4499,
        discountPercentage: 12,
        description: {
          fabric: 'Jacquard Silk & Cotton',
          material: 'Cotton Silk Blend Kurta, Jacquard Jacket',
          quality: 'Royal Finish Ethnic Suit',
          weight: '750 grams',
          color: 'Cream Kurta, Royal Blue Jacket',
          design: 'Classic Floral Jacquard weave',
          pattern: 'Straight Kurta Set with pocket square',
          sleeveType: 'Full Sleeve',
          neckType: 'Mandarin Collar',
          occasion: 'Wedding Sangeet / Diwali Puja',
          washCare: 'Dry Clean Recommended',
        },
        sizes: ['M', 'L', 'XL', 'XXL'],
        stock: 8,
        images: ['/images/products/mens_wear.png'],
        averageRating: 4.8,
        numReviews: 1,
      },
      {
        name: 'Kids Festive Lehenga Choli Set',
        code: 'KIDS-LEHENGA-18',
        brand: 'Nishi Kids',
        category: 'Kids Wear',
        originalPrice: 1799,
        discountPercentage: 10,
        description: {
          fabric: 'Soft Net & Satin Lining',
          material: 'Satin Silk top, Net Skirt, Inner Cotton lining',
          quality: 'No-itch soft seams for children',
          weight: '320 grams',
          color: 'Magenta and Gold sparkles',
          design: 'Sequin border with gold highlights',
          pattern: 'Elasticized kids lehenga set',
          sleeveType: 'Puff sleeves',
          neckType: 'Round Neck',
          occasion: 'Wedding / Diwali Party',
          washCare: 'Dry Clean or Handwash cold',
        },
        sizes: ['S', 'M', 'L'],
        stock: 16,
        images: ['/images/products/kids_wear.png'],
        averageRating: 4.4,
        numReviews: 1,
      },
      {
        name: 'Royal Kanjeevaram Kora Silk Saree',
        code: 'SAREE-KANJEEVARAM-19',
        brand: 'Kanchi Weavers',
        category: 'Saree',
        originalPrice: 7499,
        discountPercentage: 10,
        description: {
          fabric: 'Pure Kanjeevaram Kora Silk',
          material: 'Traditional Weft Zari Silk',
          quality: 'Premium Gold Thread Weave',
          weight: '780 grams',
          color: 'Fuschia Pink & Gold',
          design: 'All-over Traditional motifs',
          pattern: 'Wide Zari Border Saree',
          sleeveType: 'Unstitched Blouse Piece included',
          neckType: 'Customizable',
          occasion: 'Festive Wear / Marriage',
          washCare: 'Dry Clean Only',
        },
        sizes: ['M', 'L', 'XL'],
        stock: 14,
        images: ['/images/products/saree_kanjeevaram.png'],
        averageRating: 4.9,
        numReviews: 1,
      },
      {
        name: 'Designer Print Georgette Sharara Suit',
        code: 'SUIT-SHARARA-20',
        brand: 'Jaipur Shringar',
        category: 'Salwar Suit',
        originalPrice: 3999,
        discountPercentage: 15,
        description: {
          fabric: 'Faux Georgette fabric',
          material: 'Georgette Top, Georgette Sharara, Net Dupatta',
          quality: 'Silver Gota Border Highlights',
          weight: '710 grams',
          color: 'Soft Lavender Lilac',
          design: 'Floral Print motifs',
          pattern: 'Stitched Sharara Suit set',
          sleeveType: 'Short Sleeve',
          neckType: 'V-neck',
          occasion: 'Mehendi / Haldi celebration',
          washCare: 'Dry Clean Recommended',
        },
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 12,
        images: ['/images/products/suit_sharara.png'],
        averageRating: 4.7,
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
