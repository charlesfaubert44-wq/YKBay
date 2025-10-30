const { query } = require('../config/database');

class Trip {
    static async create(tripData) {
        const sql = `
            INSERT INTO trips (
                user_id, title, activity_type, start_date, end_date,
                start_location, end_location, route_data, difficulty_level,
                estimated_duration, group_size, emergency_contacts,
                equipment_list, notes, weather_conditions, status, is_public
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            tripData.user_id,
            tripData.title,
            tripData.activity_type,
            tripData.start_date,
            tripData.end_date,
            JSON.stringify(tripData.start_location),
            JSON.stringify(tripData.end_location || null),
            JSON.stringify(tripData.route_data || null),
            tripData.difficulty_level || null,
            tripData.estimated_duration || null,
            tripData.group_size || 1,
            JSON.stringify(tripData.emergency_contacts || []),
            JSON.stringify(tripData.equipment_list || []),
            tripData.notes || null,
            JSON.stringify(tripData.weather_conditions || null),
            tripData.status || 'planning',
            tripData.is_public || false
        ];

        const result = await query(sql, values);
        return result.lastID;
    }

    static async findById(id) {
        const sql = `
            SELECT t.*, u.username, u.email
            FROM trips t
            JOIN users u ON t.user_id = u.id
            WHERE t.id = ?
        `;
        return await query(sql, [id], true);
    }

    static async findByUserId(userId) {
        const sql = `
            SELECT t.*, u.username, u.email
            FROM trips t
            JOIN users u ON t.user_id = u.id
            WHERE t.user_id = ?
            ORDER BY t.start_date DESC
        `;
        return await query(sql, [userId]);
    }

    static async findAll(filters = {}) {
        let sql = `
            SELECT t.*, u.username, u.email
            FROM trips t
            JOIN users u ON t.user_id = u.id
            WHERE 1=1
        `;
        const values = [];

        if (filters.activity_type) {
            sql += ' AND t.activity_type = ?';
            values.push(filters.activity_type);
        }

        if (filters.status) {
            sql += ' AND t.status = ?';
            values.push(filters.status);
        }

        if (filters.is_public !== undefined) {
            sql += ' AND t.is_public = ?';
            values.push(filters.is_public ? 1 : 0);
        }

        if (filters.start_date) {
            sql += ' AND t.start_date >= ?';
            values.push(filters.start_date);
        }

        if (filters.end_date) {
            sql += ' AND t.end_date <= ?';
            values.push(filters.end_date);
        }

        sql += ' ORDER BY t.start_date DESC';

        if (filters.limit) {
            sql += ' LIMIT ?';
            values.push(filters.limit);
        }

        if (filters.offset) {
            sql += ' OFFSET ?';
            values.push(filters.offset);
        }

        return await query(sql, values);
    }

    static async update(id, tripData) {
        const fields = [];
        const values = [];

        // Dynamically build update query based on provided fields
        const allowedFields = [
            'title', 'activity_type', 'start_date', 'end_date',
            'start_location', 'end_location', 'route_data', 'difficulty_level',
            'estimated_duration', 'group_size', 'emergency_contacts',
            'equipment_list', 'notes', 'weather_conditions', 'status', 'is_public'
        ];

        for (const field of allowedFields) {
            if (tripData[field] !== undefined) {
                fields.push(`${field} = ?`);
                // JSON stringify object fields
                if (['start_location', 'end_location', 'route_data', 'emergency_contacts', 'equipment_list', 'weather_conditions'].includes(field)) {
                    values.push(JSON.stringify(tripData[field]));
                } else {
                    values.push(tripData[field]);
                }
            }
        }

        if (fields.length === 0) {
            return false;
        }

        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        const sql = `UPDATE trips SET ${fields.join(', ')} WHERE id = ?`;
        const result = await query(sql, values);
        return result.changes > 0;
    }

    static async delete(id) {
        const sql = 'DELETE FROM trips WHERE id = ?';
        const result = await query(sql, [id]);
        return result.changes > 0;
    }

    static async addParticipant(tripId, userId, role = 'participant') {
        const sql = `
            INSERT INTO trip_participants (trip_id, user_id, role, status)
            VALUES (?, ?, ?, 'invited')
            ON CONFLICT(trip_id, user_id) DO UPDATE SET role = ?
        `;
        const result = await query(sql, [tripId, userId, role, role]);
        return result.lastID;
    }

    static async updateParticipantStatus(tripId, userId, status) {
        const sql = `
            UPDATE trip_participants
            SET status = ?, responded_at = CURRENT_TIMESTAMP
            WHERE trip_id = ? AND user_id = ?
        `;
        const result = await query(sql, [status, tripId, userId]);
        return result.changes > 0;
    }

    static async getParticipants(tripId) {
        const sql = `
            SELECT tp.*, u.username, u.email
            FROM trip_participants tp
            JOIN users u ON tp.user_id = u.id
            WHERE tp.trip_id = ?
            ORDER BY tp.role, tp.created_at
        `;
        return await query(sql, [tripId]);
    }

    static async addCheckpoint(tripId, checkpointData) {
        const sql = `
            INSERT INTO trip_checkpoints (
                trip_id, checkpoint_order, name, location,
                expected_time, notes
            ) VALUES (?, ?, ?, ?, ?, ?)
        `;
        const values = [
            tripId,
            checkpointData.order,
            checkpointData.name || null,
            JSON.stringify(checkpointData.location),
            checkpointData.expected_time || null,
            checkpointData.notes || null
        ];
        const result = await query(sql, values);
        return result.lastID;
    }

    static async checkIn(checkpointId, notes = null) {
        const sql = `
            UPDATE trip_checkpoints
            SET checked_in = 1, actual_time = CURRENT_TIMESTAMP, notes = ?
            WHERE id = ?
        `;
        const result = await query(sql, [notes, checkpointId]);
        return result.changes > 0;
    }

    static async getCheckpoints(tripId) {
        const sql = `
            SELECT * FROM trip_checkpoints
            WHERE trip_id = ?
            ORDER BY checkpoint_order
        `;
        return await query(sql, [tripId]);
    }

    static async logExport(tripId, exportType, exportedBy, exportedTo = null, exportData = null) {
        const sql = `
            INSERT INTO trip_exports (
                trip_id, export_type, exported_to, exported_by, export_data
            ) VALUES (?, ?, ?, ?, ?)
        `;
        const values = [
            tripId,
            exportType,
            JSON.stringify(exportedTo),
            exportedBy,
            JSON.stringify(exportData)
        ];
        const result = await query(sql, values);
        return result.lastID;
    }

    static async getUpcomingTrips(userId, days = 7) {
        const sql = `
            SELECT t.*, u.username, u.email
            FROM trips t
            JOIN users u ON t.user_id = u.id
            WHERE (t.user_id = ? OR t.id IN (
                SELECT trip_id FROM trip_participants
                WHERE user_id = ? AND status = 'confirmed'
            ))
            AND t.start_date >= date('now')
            AND t.start_date <= date('now', '+${days} days')
            AND t.status IN ('planning', 'active')
            ORDER BY t.start_date
        `;
        return await query(sql, [userId, userId]);
    }

    static async getActiveTrips() {
        const sql = `
            SELECT t.*, u.username, u.email
            FROM trips t
            JOIN users u ON t.user_id = u.id
            WHERE t.status = 'active'
            ORDER BY t.start_date
        `;
        return await query(sql);
    }

    static async getTripStats(userId) {
        const sql = `
            SELECT
                COUNT(*) as total_trips,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_trips,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_trips,
                COUNT(CASE WHEN status = 'planning' THEN 1 END) as planned_trips,
                COUNT(DISTINCT activity_type) as unique_activities
            FROM trips
            WHERE user_id = ?
        `;
        return await query(sql, [userId], true);
    }
}

module.exports = Trip;