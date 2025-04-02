const db = require('../models/db'); 

// Create a Property (Only Landlords)
exports.createProperty = async (req, res) => {
    const { name, location, phone } = req.body;
    const ownerId = req.user.id; // Assuming req.user is set from authentication middleware

    if (!name || !location || !phone) {
        return res.status(400).json({ message: 'Name, location, and phone number are required' });
    }

    try {
        const result = await db.query(
            `INSERT INTO properties (name, location, phone, owner_id) VALUES ($1, $2, $3, $4) RETURNING *`,
            [name, location, phone, ownerId]
        );
        res.status(201).json({ message: 'Property created successfully', property: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: 'Error creating property', error: error.message });
    }
};

// Get all properties
exports.getAllProperties = async (req, res) => {
    try {
        const result = await db.query(`SELECT * FROM properties`);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching properties', error: error.message });
    }
};

// Get a single property by ID
exports.getPropertyById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(`SELECT * FROM properties WHERE id = $1`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Property not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching property', error: error.message });
    }
};

// Update a Property (Only Landlords)
exports.updateProperty = async (req, res) => {
    const { id } = req.params;
    const { name, location, phone } = req.body;
    const ownerId = req.user.id;

    try {
        // Check if the property exists and belongs to the user
        const property = await db.query(`SELECT * FROM properties WHERE id = $1 AND owner_id = $2`, [id, ownerId]);

        if (property.rows.length === 0) {
            return res.status(403).json({ message: 'Property not found or you are not authorized to update it' });
        }

        const result = await db.query(
            `UPDATE properties SET name = $1, location = $2, phone = $3 WHERE id = $4 RETURNING *`,
            [name || property.rows[0].name, location || property.rows[0].location, phone || property.rows[0].phone, id]
        );

        res.status(200).json({ message: 'Property updated successfully', property: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: 'Error updating property', error: error.message });
    }
};

// Delete a Property (Only Landlords)
exports.deleteProperty = async (req, res) => {
    const { id } = req.params;
    const ownerId = req.user.id;

    try {
        // Check if the property exists and belongs to the user
        const property = await db.query(`SELECT * FROM properties WHERE id = $1 AND owner_id = $2`, [id, ownerId]);

        if (property.rows.length === 0) {
            return res.status(403).json({ message: 'Property not found or you are not authorized to delete it' });
        }

        await db.query(`DELETE FROM properties WHERE id = $1`, [id]);
        res.status(200).json({ message: 'Property deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting property', error: error.message });
    }
}

// Get all properties for a specific landlord
exports.getPropertiesByLandlord = async (req, res) => {
    const landlordId = req.user.id; // Assuming req.user is set from authentication middleware

    try {
        const result = await db.query(`SELECT * FROM properties WHERE owner_id = $1`, [landlordId]);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching properties', error: error.message });
    }
};