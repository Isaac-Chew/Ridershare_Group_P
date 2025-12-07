import express from 'express';
import cors from 'cors';
import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

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

// Driver Model
const Driver = sequelize.define('Driver', {
    DriverID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "driverid"
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
    DateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: "dateofbirth"
    },
    PhoneNumber: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: "phonenumber"
    },
    Email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        field: "email"
    },
    StreetAddress: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: "streetaddress"
    },
    City: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "city"
    },
    State: {
        type: DataTypes.STRING(2),
        allowNull: true,
        field: "state"
    },
    ZipCode: {
        type: DataTypes.STRING(10),
        allowNull: true,
        field: "zipcode"
    },
    Status: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: "status"
    },
    LicenseNumber: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "licensenumber"
    },
    InsuranceID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "insuranceid"
    },
    BankID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "bankid"
    },
    VehicleID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "vehicleid"
    },
    VehicleColor: {
        type: DataTypes.STRING(30),
        allowNull: true,
        field: "vehiclecolor"
    },
    VehicleMake: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "vehiclemake"
    },
    VehicleModel: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "vehiclemodel"
    },
    VehicleLicensePlate: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: "vehiclelicenseplate"
    }
}, {
    tableName: 'driver',
    timestamps: false
});

// Trip Model
const Trip = sequelize.define('Trip', {
    RideID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "rideid"
    },
    PickUpLocation: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: "pickuplocation"
    },
    DropOffLocation: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: "dropofflocation"
    },
    EstimatedTime: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "estimatedtime"
    },
    Fare: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: "fare"
    },
    Tip: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: "tip"
    },
    RideStatus: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: "ridestatus"
    },
    RiderID: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: "riderid"
    },
    DriverID: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: "driverid"
    }
}, {
    tableName: 'trip',
    timestamps: false
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

// Verify driver owns the resource
const verifyDriverOwnership = (req, res, next) => {
    const requestedDriverId = parseInt(req.params.id);
    const loggedInDriverId = req.user.driverId;

    if (requestedDriverId !== loggedInDriverId) {
        return res.status(403).json({ 
            error: 'You can only access your own account' 
        });
    }
    next();
};

// RIDER ROUTES

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
            where: {
                rider_status: 'Active'
            },
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

        if (rider.rider_status === 'inactive') {
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

        if (rider.rider_status === 'inactive') {
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

        if (rider.rider_status === 'inactive') {
            return res.status(400).json({ 
                error: 'Account is already inactive' 
            });
        }

        // Soft delete by setting rider status to inactive
        await rider.update({ rider_status: 'inactive' });

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

// DRIVER ROUTES

// POST new driver (user can register)
app.post('/api/driver', async (req, res) => {
    try {
        const {
            FirstName,
            LastName,
            DateOfBirth,
            PhoneNumber,
            Email,
            StreetAddress,
            City,
            State,
            ZipCode,
            Status,
            LicenseNumber,
            InsuranceID,
            BankID,
            VehicleID,
            VehicleColor,
            VehicleMake,
            VehicleModel,
            VehicleLicensePlate
        } = req.body;

        // Validate required fields
        if (!FirstName || !LastName || !DateOfBirth || !Email) {
            return res.status(400).json({ 
                error: 'Missing required fields' 
            });
        }

        // Check if email already exists
        const existingDriver = await Driver.findOne({ where: { Email } });
        if (existingDriver) {
            return res.status(409).json({ 
                error: 'Email already registered' 
            });
        }

        // Create new driver
        const newDriver = await Driver.create({
            FirstName,
            LastName,
            DateOfBirth,
            PhoneNumber,
            Email,
            StreetAddress,
            City,
            State,
            ZipCode,
            Status,
            LicenseNumber,
            InsuranceID,
            BankID,
            VehicleID,
            VehicleColor,
            VehicleMake,
            VehicleModel,
            VehicleLicensePlate
        });

        res.status(201).json({
            message: 'Driver registered successfully',
            driver: {
                DriverID: newDriver.DriverID,
                FirstName: newDriver.FirstName,
                LastName: newDriver.LastName,
                Email: newDriver.Email
            }
        });
    } catch (err) {
        console.error('Error creating driver:', err);
        res.status(500).json({ 
            error: 'Failed to register driver' 
        });
    }
});

// GET all drivers (for admin/table view - MVP: no auth required)
app.get('/api/driver', async (req, res) => {
    try {
        const drivers = await Driver.findAll({
            order: [['DriverID', 'ASC']]
        });

        res.status(200).json({ drivers });
    } catch (err) {
        console.error('Error fetching drivers:', err);
        res.status(500).json({ 
            error: 'Failed to fetch drivers' 
        });
    }
});

// GET driver by id (driver can only see their own details)
app.get('/api/driver/:id', authenticateToken, verifyDriverOwnership, async (req, res) => {
    try {
        const { id } = req.params;

        const driver = await Driver.findByPk(id);

        if (!driver) {
            return res.status(404).json({ 
                error: 'Driver not found' 
            });
        }

        if (driver.Status === 'inactive') {
            return res.status(403).json({ 
                error: 'Account is inactive' 
            });
        }

        res.status(200).json({ driver });
    } catch (err) {
        console.error('Error fetching driver:', err);
        res.status(500).json({ 
            error: 'Failed to fetch driver details' 
        });
    }
});

// PUT update driver (MVP: no auth required for admin interface)
app.put('/api/driver/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            FirstName,
            LastName,
            DateOfBirth,
            PhoneNumber,
            Email,
            StreetAddress,
            City,
            State,
            ZipCode,
            Status,
            LicenseNumber,
            InsuranceID,
            BankID,
            VehicleID,
            VehicleColor,
            VehicleMake,
            VehicleModel,
            VehicleLicensePlate
        } = req.body;

        const driver = await Driver.findByPk(id);

        if (!driver) {
            return res.status(404).json({ 
                error: 'Driver not found' 
            });
        }

        if (driver.Status === 'inactive') {
            return res.status(403).json({ 
                error: 'Cannot update inactive account' 
            });
        }

        // If email is being changed, check for duplicates
        if (Email && Email !== driver.Email) {
            const existingDriver = await Driver.findOne({ where: { Email } });
            if (existingDriver) {
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
        if (PhoneNumber !== undefined) updateData.PhoneNumber = PhoneNumber;
        if (Email) updateData.Email = Email;
        if (StreetAddress !== undefined) updateData.StreetAddress = StreetAddress;
        if (City !== undefined) updateData.City = City;
        if (State !== undefined) updateData.State = State;
        if (ZipCode !== undefined) updateData.ZipCode = ZipCode;
        if (Status) updateData.Status = Status;
        if (LicenseNumber !== undefined) updateData.LicenseNumber = LicenseNumber;
        if (InsuranceID !== undefined) updateData.InsuranceID = InsuranceID;
        if (BankID !== undefined) updateData.BankID = BankID;
        if (VehicleID !== undefined) updateData.VehicleID = VehicleID;
        if (VehicleColor !== undefined) updateData.VehicleColor = VehicleColor;
        if (VehicleMake !== undefined) updateData.VehicleMake = VehicleMake;
        if (VehicleModel !== undefined) updateData.VehicleModel = VehicleModel;
        if (VehicleLicensePlate !== undefined) updateData.VehicleLicensePlate = VehicleLicensePlate;

        await driver.update(updateData);

        res.status(200).json({
            message: 'Driver updated successfully',
            driver
        });
    } catch (err) {
        console.error('Error updating driver:', err);
        res.status(500).json({ 
            error: 'Failed to update driver' 
        });
    }
});

// DELETE driver (driver can deactivate their own account)
app.delete('/api/driver/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const driver = await Driver.findByPk(id);

        if (!driver) {
            return res.status(404).json({ 
                error: 'Driver not found' 
            });
        }

        if (driver.Status === 'inactive') {
            return res.status(400).json({ 
                error: 'Account is already inactive' 
            });
        }

        // Soft delete by setting Status to inactive
        await driver.update({ Status: 'inactive' });

        res.status(200).json({
            message: 'Account deactivated successfully'
        });
    } catch (err) {
        console.error('Error deactivating driver:', err);
        res.status(500).json({ 
            error: 'Failed to deactivate account' 
        });
    }
});

// TRIP ROUTES

// POST new trip (rider requests ride)
app.post('/api/trip', async (req, res) => {
    try {
        const {
            PickUpLocation,
            DropOffLocation,
            EstimatedTime,
            Fare,
            Tip,
            RideStatus,
            RiderID,
            DriverID
        } = req.body;

        // Validate required fields
        if (!PickUpLocation || !DropOffLocation || !RiderID) {
            return res.status(400).json({ 
                error: 'Missing required fields: PickUpLocation, DropOffLocation, and RiderID are required' 
            });
        }

        // Create new trip
        const newTrip = await Trip.create({
            PickUpLocation,
            DropOffLocation,
            EstimatedTime,
            Fare,
            Tip,
            RideStatus: 'Requested', // Always set to Requested for new trips
            RiderID,
            DriverID: DriverID || null
        });

        res.status(201).json({
            message: 'Trip created successfully',
            trip: newTrip
        });
    } catch (err) {
        console.error('Error creating trip:', err);
        res.status(500).json({ 
            error: 'Failed to create trip' 
        });
    }
});

// GET all trips
app.get('/api/trip', async (req, res) => {
    try {
        const trips = await Trip.findAll({
            order: [['RideID', 'ASC']]
        });

        res.status(200).json({ trips });
    } catch (err) {
        console.error('Error fetching trips:', err);
        res.status(500).json({ 
            error: 'Failed to fetch trips' 
        });
    }
});

// GET trips by RiderID (email)
app.get('/api/trip/rider/:RiderID', async (req, res) => {
    try {
        const { RiderID } = req.params;

        if (!RiderID || RiderID.trim() === '') {
            return res.status(400).json({ 
                error: 'Invalid rider email' 
            });
        }

        const trips = await Trip.findAll({
            where: {
                RiderID: RiderID
            },
            order: [['RideID', 'ASC']]
        });

        res.status(200).json({ trips });
    } catch (err) {
        console.error('Error fetching trips by rider:', err);
        res.status(500).json({ 
            error: 'Failed to fetch trips' 
        });
    }
});

// GET trips by DriverID (email)
app.get('/api/trip/driver/:DriverID', async (req, res) => {
    try {
        const { DriverID } = req.params;

        if (!DriverID || DriverID.trim() === '') {
            return res.status(400).json({ 
                error: 'Invalid driver email' 
            });
        }

        const trips = await Trip.findAll({
            where: {
                DriverID: DriverID
            },
            order: [['RideID', 'ASC']]
        });

        res.status(200).json({ trips });
    } catch (err) {
        console.error('Error fetching trips by driver:', err);
        res.status(500).json({ 
            error: 'Failed to fetch trips' 
        });
    }
});

// GET trips by RideStatus
app.get('/api/trip/status/:status', async (req, res) => {
    try {
        const { status } = req.params;

        const trips = await Trip.findAll({
            where: {
                RideStatus: status
            },
            order: [['RideID', 'ASC']]
        });

        res.status(200).json({ trips });
    } catch (err) {
        console.error('Error fetching trips by status:', err);
        res.status(500).json({ 
            error: 'Failed to fetch trips' 
        });
    }
});

// PUT update trip (accept trip - driver accepts ride)
app.put('/api/trip/:id/accept', async (req, res) => {
    try {
        const { id } = req.params;
        const { DriverID } = req.body;
        const tripIdInt = parseInt(id);

        if (isNaN(tripIdInt)) {
            return res.status(400).json({ 
                error: 'Invalid trip ID' 
            });
        }

        if (!DriverID || DriverID.trim() === '') {
            return res.status(400).json({ 
                error: 'Driver email is required' 
            });
        }

        const trip = await Trip.findByPk(tripIdInt);

        if (!trip) {
            return res.status(404).json({ 
                error: 'Trip not found' 
            });
        }

        // Validate that trip is in Requested status
        if (trip.RideStatus !== 'Requested') {
            return res.status(400).json({ 
                error: 'Trip is not available for acceptance. Only trips with status "Requested" can be accepted.' 
            });
        }

        // Validate that trip doesn't already have a driver
        if (trip.DriverID !== null && trip.DriverID !== '') {
            return res.status(400).json({ 
                error: 'Trip has already been accepted by another driver' 
            });
        }

        // Update trip: set DriverID (email) and change status to InProgress
        await trip.update({ 
            DriverID: DriverID,
            RideStatus: 'InProgress'
        });

        res.status(200).json({
            message: 'Trip accepted successfully',
            trip
        });
    } catch (err) {
        console.error('Error accepting trip:', err);
        res.status(500).json({ 
            error: 'Failed to accept trip' 
        });
    }
});

// DELETE trip (soft delete by setting RideStatus to Cancelled)
app.delete('/api/trip/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const tripIdInt = parseInt(id);

        if (isNaN(tripIdInt)) {
            return res.status(400).json({ 
                error: 'Invalid trip ID' 
            });
        }

        const trip = await Trip.findByPk(tripIdInt);

        if (!trip) {
            return res.status(404).json({ 
                error: 'Trip not found' 
            });
        }

        // Soft delete by setting RideStatus to Cancelled
        await trip.update({ RideStatus: 'Cancelled' });

        res.status(200).json({
            message: 'Trip cancelled successfully',
            trip
        });
    } catch (err) {
        console.error('Error cancelling trip:', err);
        res.status(500).json({ 
            error: 'Failed to cancel trip' 
        });
    }
});


// START SERVER
