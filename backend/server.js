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
const PORT = process.env.PORT || 3001;

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
const Rider = sequelize.define('riders', {
    RiderID: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true
    },
    FirstName: { 
        type: DataTypes.STRING(100), 
        allowNull: false 
    },
    LastName: { 
        type: DataTypes.STRING(100), 
        allowNull: false 
    },
    DateofBirth: { 
        type: DataTypes.DATE, 
        allowNull: false 
    },
    PhoneNumber: { 
        type: DataTypes.STRING(15), 
        allowNull: true, 
    },
    Email: { 
        type: DataTypes.STRING(100), 
        allowNull: false, 
        defaultValue: false 
    },
    StreetAddress: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    City: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    State: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    ZipCode: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    LocationStatus: {
        type: DataTypes.ENUM('on', 'off'),
        allowNull: false,
        defaultValue: 'off'
    },
    AccountStatus: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
    },
}, {
  tableName: 'riders',
  timestamps: true,
  underscored: true
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
            DateofBirth,
            PhoneNumber,
            Email,
            StreetAddress,
            City,
            State,
            ZipCode
        } = req.body;

        // Validate required fields
        if (!FirstName || !LastName || !DateofBirth || !Email || !StreetAddress || !City || !State || !ZipCode) {
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
            DateofBirth,
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
        if (rider.AccountStatus === 'inactive') {
            return res.status(403).json({ 
                error: 'Account is inactive' 
            });
        }

        res.status(200).json({ rider });
    } catch (err) {
        console.error('Error fetching rider:', err);
        res.status(500).json({ 
            error: 'Failed to fetch rider details' 
        });
    }
});

// PUT update rider (rider can update their own details)
app.put('/api/riders/:id', authenticateToken, verifyRiderOwnership, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            FirstName,
            LastName,
            DateofBirth,
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

        if (rider.AccountStatus === 'inactive') {
            return res.status(403).json({ 
                error: 'Cannot update inactive account' 
            });
        }

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
        if (DateofBirth) updateData.DateofBirth = DateofBirth;
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

// START SERVER
