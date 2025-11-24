import express from 'express';
import cors from 'cors';
import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Middleware
app.use(cors());
app.use(express.json());

// DATABASE CONNECTIONS

// Set up database connection
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false }
    }
});

// Test database connection
try {
    await sequelize.authenticate();
    console.log('Database connected successfully!');
} catch (err) {
    console.error('Unable to connect to database:', err);
    process.exit(1);
}

// MODELS

// Rider Model
const Rider = sequelize.define('Rider', {
    RiderID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "riderid"
    },
    FirstName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "firstname"
    },
    LastName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "lastname"
    },
    Email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        field: "email"
    },
    PhoneNumber: {
        type: DataTypes.STRING(15),
        allowNull: true,
        field: "phonenumber"
    },
    signup_date: {
        type: DataTypes.DATE,
        field: "signup_date"
    },
    rider_status: {
        type: DataTypes.STRING(20),
        field: "rider_status"
    },
    DateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: "dateofbirth"
    },
    StreetAddress: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "streetaddress"
    },
    City: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "city"
    },
    State: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "state"
    },
    ZipCode: {
        type: DataTypes.STRING(10),
        allowNull: false,
        field: "zipcode"
    },
    LocationStatus: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: "locationstatus"
    }
}, {
    tableName: 'riders',
    timestamps: false   // VERY IMPORTANT
});

// AUTHENTICATION MIDDLEWARE

// Verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user; // Attach user info to request
        next();
    });
};

// Verify rider owns the resource
const verifyRiderOwnership = (req, res, next) => {
    const requestedRiderId = parseInt(req.params.id);
    const loggedInRiderId = req.user.riderId;

    if (requestedRiderId !== loggedInRiderId) {
        return res.status(403).json({ 
            error: 'You can only access your own account' 
        });
    }
    next();
};

// ROUTES

// POST new rider (user can register)
app.post('/api/riders', async (req, res) => {
    try {
        const {
            FirstName,
            LastName,
            DateOfBirth,
            signup_date,
            rider_status,
            PhoneNumber,
            Email,
            StreetAddress,
            City,
            State,
            ZipCode
        } = req.body;

        // Validate required fields
        if (!FirstName || !LastName || !DateOfBirth || !Email || !StreetAddress || !City || !State || !ZipCode) {
            return res.status(400).json({ 
                error: 'Missing required fields' 
            });
        }

        // Check if email already exists
        const existingRider = await Rider.findOne({ where: { Email } });
        if (existingRider) {
            return res.status(409).json({ 
                error: 'Email already registered' 
            });
        }

        // Create new rider
        const newRider = await Rider.create({
            FirstName,
            LastName,
            DateOfBirth,
            signup_date,
            rider_status,
            PhoneNumber,
            Email,
            StreetAddress,
            City,
            State,
            ZipCode
        });

        res.status(201).json({
            message: 'Rider registered successfully',
            rider: {
                RiderID: newRider.RiderID,
                FirstName: newRider.FirstName,
                LastName: newRider.LastName,
                Email: newRider.Email
            }
        });
    } catch (err) {
        console.error('Error creating rider:', err);
        res.status(500).json({ 
            error: 'Failed to register rider' 
        });
    }
});

// GET all riders (for admin/table view - MVP: no auth required)
app.get('/api/riders', async (req, res) => {
    try {
        const riders = await Rider.findAll({
            // Temporarily removed AccountStatus filter - check if column exists in database
            // where: {
            //     AccountStatus: 'active'
            // },
            order: [['RiderID', 'ASC']]
        });

        res.status(200).json({ riders });
    } catch (err) {
        console.error('Error fetching riders:', err);
        res.status(500).json({ 
            error: 'Failed to fetch riders' 
        });
    }
});

// GET rider by id (rider can only see their own details)
app.get('/api/riders/:id', authenticateToken, verifyRiderOwnership, async (req, res) => {
    try {
        const { id } = req.params;

        // TODO: Add authentication middleware to verify the logged-in rider
        // matches the requested ID before deployment

        const rider = await Rider.findByPk(id);

        if (!rider) {
            return res.status(404).json({ 
                error: 'Rider not found' 
            });
        }

        // Only return active accounts
        /*
        if (rider.AccountStatus === 'inactive') {
            return res.status(403).json({ 
                error: 'Account is inactive' 
            });
        }
        */

        res.status(200).json({ rider });
    } catch (err) {
        console.error('Error fetching rider:', err);
        res.status(500).json({ 
            error: 'Failed to fetch rider details' 
        });
    }
});

// PUT update rider (MVP: no auth required for admin interface)
app.put('/api/riders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            FirstName,
            LastName,
            DateOfBirth,
            signup_date,
            rider_status,
            PhoneNumber,
            Email,
            StreetAddress,
            City,
            State,
            ZipCode,
            LocationStatus
        } = req.body;

        // TODO: Add authentication middleware to verify the logged-in rider
        // matches the requested ID before deployment

        const rider = await Rider.findByPk(id);

        if (!rider) {
            return res.status(404).json({ 
                error: 'Rider not found' 
            });
        }

        /*
        if (rider.AccountStatus === 'inactive') {
            return res.status(403).json({ 
                error: 'Cannot update inactive account' 
            });
        }
        */

        // If email is being changed, check for duplicates
        if (Email && Email !== rider.Email) {
            const existingRider = await Rider.findOne({ where: { Email } });
            if (existingRider) {
                return res.status(409).json({ 
                    error: 'Email already in use' 
                });
            }
        }

        // Update only provided fields
        const updateData = {};
        if (FirstName) updateData.FirstName = FirstName;
        if (LastName) updateData.LastName = LastName;
        if (DateOfBirth) updateData.DateOfBirth = DateOfBirth;
        if (signup_date) updateData.signup_date = signup_date;
        if (rider_status) updateData.rider_status = rider_status;
        if (PhoneNumber !== undefined) updateData.PhoneNumber = PhoneNumber;
        if (Email) updateData.Email = Email;
        if (StreetAddress) updateData.StreetAddress = StreetAddress;
        if (City) updateData.City = City;
        if (State) updateData.State = State;
        if (ZipCode) updateData.ZipCode = ZipCode;
        if (LocationStatus) updateData.LocationStatus = LocationStatus;

        await rider.update(updateData);

        res.status(200).json({
            message: 'Rider updated successfully',
            rider
        });
    } catch (err) {
        console.error('Error updating rider:', err);
        res.status(500).json({ 
            error: 'Failed to update rider' 
        });
    }
});

// DELETE rider (rider can deactivate their own account)
/*
app.delete('/api/riders/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // TODO: Add authentication middleware to verify the logged-in rider
        // matches the requested ID before deployment

        const rider = await Rider.findByPk(id);

        if (!rider) {
            return res.status(404).json({ 
                error: 'Rider not found' 
            });
        }

        if (rider.AccountStatus === 'inactive') {
            return res.status(400).json({ 
                error: 'Account is already inactive' 
            });
        }

        // Soft delete by setting AccountStatus to inactive
        await rider.update({ AccountStatus: 'inactive' });

        res.status(200).json({
            message: 'Account deactivated successfully'
        });
    } catch (err) {
        console.error('Error deactivating rider:', err);
        res.status(500).json({ 
            error: 'Failed to deactivate account' 
        });
    }
});
*/

// START SERVER
