const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const auth = require('../middleware/auth');
const { exportService } = require('../services/exportService');
const { emailService } = require('../services/emailService');

// Create new trip
router.post('/', auth, async (req, res) => {
    try {
        const tripData = {
            ...req.body,
            user_id: req.user.userId
        };

        const tripId = await Trip.create(tripData);
        const trip = await Trip.findById(tripId);

        res.status(201).json({
            success: true,
            trip
        });
    } catch (error) {
        console.error('Error creating trip:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create trip'
        });
    }
});

// Get user's trips
router.get('/', auth, async (req, res) => {
    try {
        const { status, activity_type, upcoming } = req.query;

        let trips;
        if (upcoming === 'true') {
            trips = await Trip.getUpcomingTrips(req.user.userId);
        } else {
            trips = await Trip.findByUserId(req.user.userId);
        }

        // Filter by status if provided
        if (status) {
            trips = trips.filter(t => t.status === status);
        }

        // Filter by activity type if provided
        if (activity_type) {
            trips = trips.filter(t => t.activity_type === activity_type);
        }

        res.json({
            success: true,
            trips
        });
    } catch (error) {
        console.error('Error fetching trips:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch trips'
        });
    }
});

// Get public trips
router.get('/public', async (req, res) => {
    try {
        const { activity_type, limit = 20, offset = 0 } = req.query;

        const trips = await Trip.findAll({
            is_public: true,
            activity_type,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            trips
        });
    } catch (error) {
        console.error('Error fetching public trips:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch public trips'
        });
    }
});

// Get trip details
router.get('/:id', auth, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);

        if (!trip) {
            return res.status(404).json({
                success: false,
                error: 'Trip not found'
            });
        }

        // Check if user has access to this trip
        const participants = await Trip.getParticipants(req.params.id);
        const isParticipant = participants.some(p => p.user_id === req.user.userId);

        if (trip.user_id !== req.user.userId && !isParticipant && !trip.is_public) {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        // Parse JSON fields
        if (trip.start_location) trip.start_location = JSON.parse(trip.start_location);
        if (trip.end_location) trip.end_location = JSON.parse(trip.end_location);
        if (trip.route_data) trip.route_data = JSON.parse(trip.route_data);
        if (trip.emergency_contacts) trip.emergency_contacts = JSON.parse(trip.emergency_contacts);
        if (trip.equipment_list) trip.equipment_list = JSON.parse(trip.equipment_list);
        if (trip.weather_conditions) trip.weather_conditions = JSON.parse(trip.weather_conditions);

        // Get checkpoints and participants
        const checkpoints = await Trip.getCheckpoints(req.params.id);
        checkpoints.forEach(checkpoint => {
            if (checkpoint.location) checkpoint.location = JSON.parse(checkpoint.location);
        });

        res.json({
            success: true,
            trip: {
                ...trip,
                checkpoints,
                participants
            }
        });
    } catch (error) {
        console.error('Error fetching trip:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch trip details'
        });
    }
});

// Update trip
router.put('/:id', auth, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);

        if (!trip) {
            return res.status(404).json({
                success: false,
                error: 'Trip not found'
            });
        }

        // Only trip owner can update
        if (trip.user_id !== req.user.userId) {
            return res.status(403).json({
                success: false,
                error: 'Only trip owner can update trip'
            });
        }

        await Trip.update(req.params.id, req.body);
        const updatedTrip = await Trip.findById(req.params.id);

        res.json({
            success: true,
            trip: updatedTrip
        });
    } catch (error) {
        console.error('Error updating trip:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update trip'
        });
    }
});

// Delete trip
router.delete('/:id', auth, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);

        if (!trip) {
            return res.status(404).json({
                success: false,
                error: 'Trip not found'
            });
        }

        // Only trip owner can delete
        if (trip.user_id !== req.user.userId) {
            return res.status(403).json({
                success: false,
                error: 'Only trip owner can delete trip'
            });
        }

        await Trip.delete(req.params.id);

        res.json({
            success: true,
            message: 'Trip deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting trip:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete trip'
        });
    }
});

// Add participants
router.post('/:id/participants', auth, async (req, res) => {
    try {
        const { user_id, role = 'participant' } = req.body;
        const trip = await Trip.findById(req.params.id);

        if (!trip) {
            return res.status(404).json({
                success: false,
                error: 'Trip not found'
            });
        }

        // Only trip owner can add participants
        if (trip.user_id !== req.user.userId) {
            return res.status(403).json({
                success: false,
                error: 'Only trip owner can add participants'
            });
        }

        await Trip.addParticipant(req.params.id, user_id, role);
        const participants = await Trip.getParticipants(req.params.id);

        res.json({
            success: true,
            participants
        });
    } catch (error) {
        console.error('Error adding participant:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add participant'
        });
    }
});

// Update participant status
router.put('/:id/participants/:userId', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const { id: tripId, userId: participantId } = req.params;

        // User can only update their own status
        if (parseInt(participantId) !== req.user.userId) {
            return res.status(403).json({
                success: false,
                error: 'You can only update your own participation status'
            });
        }

        await Trip.updateParticipantStatus(tripId, participantId, status);

        res.json({
            success: true,
            message: 'Participation status updated'
        });
    } catch (error) {
        console.error('Error updating participant status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update participant status'
        });
    }
});

// Add checkpoint
router.post('/:id/checkpoints', auth, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);

        if (!trip) {
            return res.status(404).json({
                success: false,
                error: 'Trip not found'
            });
        }

        // Only trip owner can add checkpoints
        if (trip.user_id !== req.user.userId) {
            return res.status(403).json({
                success: false,
                error: 'Only trip owner can add checkpoints'
            });
        }

        const checkpointId = await Trip.addCheckpoint(req.params.id, req.body);
        const checkpoints = await Trip.getCheckpoints(req.params.id);

        res.json({
            success: true,
            checkpointId,
            checkpoints
        });
    } catch (error) {
        console.error('Error adding checkpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add checkpoint'
        });
    }
});

// Check in at checkpoint
router.post('/:id/checkin', auth, async (req, res) => {
    try {
        const { checkpointId, notes } = req.body;
        const trip = await Trip.findById(req.params.id);

        if (!trip) {
            return res.status(404).json({
                success: false,
                error: 'Trip not found'
            });
        }

        // Check if user is participant or owner
        const participants = await Trip.getParticipants(req.params.id);
        const isParticipant = participants.some(p => p.user_id === req.user.userId);

        if (trip.user_id !== req.user.userId && !isParticipant) {
            return res.status(403).json({
                success: false,
                error: 'Only trip participants can check in'
            });
        }

        await Trip.checkIn(checkpointId, notes);

        res.json({
            success: true,
            message: 'Checked in successfully'
        });
    } catch (error) {
        console.error('Error checking in:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check in'
        });
    }
});

// Export trip as PDF
router.post('/:id/export', auth, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);

        if (!trip) {
            return res.status(404).json({
                success: false,
                error: 'Trip not found'
            });
        }

        // Check access
        const participants = await Trip.getParticipants(req.params.id);
        const isParticipant = participants.some(p => p.user_id === req.user.userId);

        if (trip.user_id !== req.user.userId && !isParticipant && !trip.is_public) {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        // Get full trip details
        const checkpoints = await Trip.getCheckpoints(req.params.id);
        const fullTrip = {
            ...trip,
            checkpoints,
            participants
        };

        // Parse JSON fields
        if (fullTrip.start_location) fullTrip.start_location = JSON.parse(fullTrip.start_location);
        if (fullTrip.end_location) fullTrip.end_location = JSON.parse(fullTrip.end_location);
        if (fullTrip.route_data) fullTrip.route_data = JSON.parse(fullTrip.route_data);
        if (fullTrip.emergency_contacts) fullTrip.emergency_contacts = JSON.parse(fullTrip.emergency_contacts);
        if (fullTrip.equipment_list) fullTrip.equipment_list = JSON.parse(fullTrip.equipment_list);
        if (fullTrip.weather_conditions) fullTrip.weather_conditions = JSON.parse(fullTrip.weather_conditions);

        // Generate PDF
        const pdfBuffer = await exportService.generateTripPDF(fullTrip);

        // Log export
        await Trip.logExport(req.params.id, 'pdf', req.user.userId);

        // Send PDF
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="trip-${req.params.id}.pdf"`
        });
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error exporting trip:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to export trip'
        });
    }
});

// Email trip plan
router.post('/:id/email', auth, async (req, res) => {
    try {
        const { recipients } = req.body;
        const trip = await Trip.findById(req.params.id);

        if (!trip) {
            return res.status(404).json({
                success: false,
                error: 'Trip not found'
            });
        }

        // Only trip owner can email
        if (trip.user_id !== req.user.userId) {
            return res.status(403).json({
                success: false,
                error: 'Only trip owner can email trip plans'
            });
        }

        // Get full trip details
        const checkpoints = await Trip.getCheckpoints(req.params.id);
        const participants = await Trip.getParticipants(req.params.id);
        const fullTrip = {
            ...trip,
            checkpoints,
            participants
        };

        // Parse JSON fields
        if (fullTrip.start_location) fullTrip.start_location = JSON.parse(fullTrip.start_location);
        if (fullTrip.end_location) fullTrip.end_location = JSON.parse(fullTrip.end_location);
        if (fullTrip.route_data) fullTrip.route_data = JSON.parse(fullTrip.route_data);
        if (fullTrip.emergency_contacts) fullTrip.emergency_contacts = JSON.parse(fullTrip.emergency_contacts);
        if (fullTrip.equipment_list) fullTrip.equipment_list = JSON.parse(fullTrip.equipment_list);
        if (fullTrip.weather_conditions) fullTrip.weather_conditions = JSON.parse(fullTrip.weather_conditions);

        // Send email
        await emailService.sendTripPlan(fullTrip, recipients);

        // Log export
        await Trip.logExport(req.params.id, 'email', req.user.userId, recipients);

        res.json({
            success: true,
            message: `Trip plan emailed to ${recipients.length} recipient(s)`
        });
    } catch (error) {
        console.error('Error emailing trip:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to email trip plan'
        });
    }
});

// Get trip statistics
router.get('/stats/user', auth, async (req, res) => {
    try {
        const stats = await Trip.getTripStats(req.user.userId);

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Error fetching trip stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch trip statistics'
        });
    }
});

module.exports = router;