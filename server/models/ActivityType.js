const { query } = require('../config/database');

class ActivityType {
    static async findAll(category = null) {
        let sql = 'SELECT * FROM activity_types';
        const values = [];

        if (category) {
            sql += ' WHERE category = ?';
            values.push(category);
        }

        sql += ' ORDER BY category, name';
        return await query(sql, values);
    }

    static async findByName(name) {
        const sql = 'SELECT * FROM activity_types WHERE name = ?';
        return await query(sql, [name], true);
    }

    static async create(activityData) {
        const sql = `
            INSERT INTO activity_types (
                name, category, icon, seasonal_availability, required_equipment
            ) VALUES (?, ?, ?, ?, ?)
        `;
        const values = [
            activityData.name,
            activityData.category,
            activityData.icon || null,
            JSON.stringify(activityData.seasonal_availability || {}),
            JSON.stringify(activityData.required_equipment || [])
        ];
        const result = await query(sql, values);
        return result.lastID;
    }

    static async update(id, activityData) {
        const fields = [];
        const values = [];

        if (activityData.name) {
            fields.push('name = ?');
            values.push(activityData.name);
        }
        if (activityData.category) {
            fields.push('category = ?');
            values.push(activityData.category);
        }
        if (activityData.icon !== undefined) {
            fields.push('icon = ?');
            values.push(activityData.icon);
        }
        if (activityData.seasonal_availability) {
            fields.push('seasonal_availability = ?');
            values.push(JSON.stringify(activityData.seasonal_availability));
        }
        if (activityData.required_equipment) {
            fields.push('required_equipment = ?');
            values.push(JSON.stringify(activityData.required_equipment));
        }

        if (fields.length === 0) {
            return false;
        }

        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        const sql = `UPDATE activity_types SET ${fields.join(', ')} WHERE id = ?`;
        const result = await query(sql, values);
        return result.changes > 0;
    }

    static async delete(id) {
        const sql = 'DELETE FROM activity_types WHERE id = ?';
        const result = await query(sql, [id]);
        return result.changes > 0;
    }

    static async getSeasonalActivities(month) {
        const sql = `
            SELECT * FROM activity_types
            WHERE json_extract(seasonal_availability, '$.months') LIKE '%${month}%'
            ORDER BY category, name
        `;
        return await query(sql);
    }

    static async getRequiredEquipment(activityName) {
        const sql = `
            SELECT required_equipment FROM activity_types WHERE name = ?
        `;
        const result = await query(sql, [activityName], true);
        return result ? JSON.parse(result.required_equipment) : [];
    }
}

module.exports = ActivityType;