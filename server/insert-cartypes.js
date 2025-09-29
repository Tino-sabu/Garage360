const pool = require('./config/database');

async function insertCarTypes() {
    try {
        const insertQuery = `
            INSERT INTO cartypes (brand, model, body_type) VALUES 
            ('Toyota', 'Corolla', 'sedan'),
            ('Toyota', 'Camry', 'sedan'),
            ('Toyota', 'Innova Crysta', 'suv'),
            ('Toyota', 'Fortuner', 'suv'),
            ('Honda', 'City', 'sedan'),
            ('Honda', 'Civic', 'sedan'),
            ('Honda', 'CR-V', 'suv'),
            ('Honda', 'Amaze', 'sedan'),
            ('Hyundai', 'i20', 'hatchback'),
            ('Hyundai', 'Verna', 'sedan'),
            ('Hyundai', 'Creta', 'suv'),
            ('Hyundai', 'Tucson', 'suv'),
            ('Maruti Suzuki', 'Swift', 'hatchback'),
            ('Maruti Suzuki', 'Baleno', 'hatchback'),
            ('Maruti Suzuki', 'Dzire', 'sedan'),
            ('Maruti Suzuki', 'Ertiga', 'suv'),
            ('Mahindra', 'XUV700', 'suv'),
            ('Mahindra', 'Scorpio', 'suv'),
            ('Mahindra', 'Thar', 'suv'),
            ('Tata', 'Nexon', 'suv'),
            ('Tata', 'Harrier', 'suv'),
            ('Tata', 'Safari', 'suv'),
            ('Kia', 'Seltos', 'suv'),
            ('Kia', 'Sonet', 'suv'),
            ('BMW', '3 Series', 'sedan'),
            ('Mercedes-Benz', 'C-Class', 'sedan'),
            ('Audi', 'A4', 'sedan'),
            ('Tesla', 'Model 3', 'sedan'),
            ('Tata', 'Nexon EV', 'suv'),
            ('MG', 'ZS EV', 'suv')
        `;

        const result = await pool.query(insertQuery);
        console.log(`✅ Successfully inserted ${result.rowCount} car types!`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error inserting car types:', error);
        process.exit(1);
    }
}

insertCarTypes();