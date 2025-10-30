const express = require('express');
const router = express.Router();
const ActivityType = require('../models/ActivityType');

// Get all activity types
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        const activities = await ActivityType.findAll(category);

        // Parse JSON fields
        activities.forEach(activity => {
            if (activity.seasonal_availability) {
                activity.seasonal_availability = JSON.parse(activity.seasonal_availability);
            }
            if (activity.required_equipment) {
                activity.required_equipment = JSON.parse(activity.required_equipment);
            }
        });

        res.json({
            success: true,
            activities
        });
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch activity types'
        });
    }
});

// Get activities available in current season
router.get('/seasonal', async (req, res) => {
    try {
        const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-indexed
        const activities = await ActivityType.getSeasonalActivities(currentMonth);

        // Parse JSON fields
        activities.forEach(activity => {
            if (activity.seasonal_availability) {
                activity.seasonal_availability = JSON.parse(activity.seasonal_availability);
            }
            if (activity.required_equipment) {
                activity.required_equipment = JSON.parse(activity.required_equipment);
            }
        });

        res.json({
            success: true,
            activities,
            currentMonth
        });
    } catch (error) {
        console.error('Error fetching seasonal activities:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch seasonal activities'
        });
    }
});

// Get activity by name
router.get('/:name', async (req, res) => {
    try {
        const activity = await ActivityType.findByName(req.params.name);

        if (!activity) {
            return res.status(404).json({
                success: false,
                error: 'Activity type not found'
            });
        }

        // Parse JSON fields
        if (activity.seasonal_availability) {
            activity.seasonal_availability = JSON.parse(activity.seasonal_availability);
        }
        if (activity.required_equipment) {
            activity.required_equipment = JSON.parse(activity.required_equipment);
        }

        res.json({
            success: true,
            activity
        });
    } catch (error) {
        console.error('Error fetching activity:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch activity type'
        });
    }
});

// Get required equipment for an activity
router.get('/:name/equipment', async (req, res) => {
    try {
        const equipment = await ActivityType.getRequiredEquipment(req.params.name);

        res.json({
            success: true,
            activityName: req.params.name,
            equipment
        });
    } catch (error) {
        console.error('Error fetching equipment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch required equipment'
        });
    }
});

// Get safety guidelines for an activity
router.get('/:name/safety', async (req, res) => {
    try {
        const activity = await ActivityType.findByName(req.params.name);

        if (!activity) {
            return res.status(404).json({
                success: false,
                error: 'Activity type not found'
            });
        }

        // Safety guidelines based on activity type
        const safetyGuidelines = getSafetyGuidelines(activity.name, activity.category);

        res.json({
            success: true,
            activityName: req.params.name,
            category: activity.category,
            safetyGuidelines
        });
    } catch (error) {
        console.error('Error fetching safety guidelines:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch safety guidelines'
        });
    }
});

// Helper function to get safety guidelines
function getSafetyGuidelines(activityName, category) {
    const commonGuidelines = [
        'Always inform someone of your trip plans and expected return',
        'Carry emergency communication devices (satellite phone, InReach, etc.)',
        'Check weather forecasts before and during your trip',
        'Bring first aid kit and know how to use it',
        'Stay hydrated and bring extra food',
        'Know your limits and turn back if conditions worsen'
    ];

    const categoryGuidelines = {
        water: [
            'Always wear a properly fitted life jacket',
            'Check water conditions and ice thickness',
            'File a float plan with authorities',
            'Carry emergency signaling devices (flares, whistle)',
            'Avoid alcohol consumption while on the water',
            'Be aware of cold water immersion risks'
        ],
        winter: [
            'Dress in layers and avoid cotton',
            'Carry emergency shelter and heat source',
            'Check ice conditions with local authorities',
            'Travel with a buddy when possible',
            'Carry ice picks and know self-rescue techniques',
            'Be aware of signs of hypothermia and frostbite',
            'Ensure vehicle/equipment is winterized'
        ],
        land: [
            'Carry bear spray and know how to use it',
            'Make noise to avoid surprising wildlife',
            'Store food properly (bear-proof containers)',
            'Stay on marked trails when available',
            'Carry navigation tools (GPS, map, compass)',
            'Be prepared for sudden weather changes'
        ],
        climbing: [
            'Always use proper safety equipment',
            'Check all gear before use',
            'Climb with experienced partners',
            'Know and respect your skill level',
            'Have evacuation plan for emergencies',
            'Check anchor points carefully',
            'Be aware of objective hazards (rockfall, avalanche)'
        ]
    };

    const activitySpecific = {
        'Snowmobiling': [
            'Stay on marked trails',
            'Carry spare parts and tools',
            'Avoid traveling alone',
            'Check avalanche conditions in mountainous areas'
        ],
        'Ice Fishing': [
            'Check ice thickness (minimum 4 inches for walking)',
            'Avoid areas with current or springs',
            'Carry ice picks and rope',
            'Watch for pressure ridges and color changes in ice'
        ],
        'Boating': [
            'Check marine weather forecasts',
            'Ensure boat is properly maintained',
            'Carry required safety equipment',
            'Know navigation rules and markers'
        ],
        'Hunting': [
            'Wear hunter orange as required',
            'Treat every firearm as loaded',
            'Know your target and beyond',
            'Respect private property and regulations'
        ]
    };

    return {
        general: commonGuidelines,
        category: categoryGuidelines[category] || [],
        specific: activitySpecific[activityName] || []
    };
}

module.exports = router;