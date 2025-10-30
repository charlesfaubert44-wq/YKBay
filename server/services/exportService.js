const PDFDocument = require('pdfkit');
const moment = require('moment-timezone');

class ExportService {
    async generateTripPDF(trip) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    size: 'A4',
                    margin: 50,
                    info: {
                        Title: `Trip Plan: ${trip.title}`,
                        Author: 'FrozenShield',
                        Subject: 'Trip Planning Document',
                        Keywords: 'outdoor, trip, safety, planning'
                    }
                });

                const chunks = [];
                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));

                // Header with branding
                this.addHeader(doc, trip);

                // Emergency contacts - PROMINENT at top
                this.addEmergencyContacts(doc, trip.emergency_contacts);

                // Trip overview
                this.addTripOverview(doc, trip);

                // Route and checkpoints
                this.addRouteInformation(doc, trip);

                // Equipment list
                this.addEquipmentList(doc, trip.equipment_list);

                // Participants
                this.addParticipants(doc, trip.participants);

                // Weather conditions
                if (trip.weather_conditions) {
                    this.addWeatherInfo(doc, trip.weather_conditions);
                }

                // Additional notes
                if (trip.notes) {
                    this.addNotes(doc, trip.notes);
                }

                // Footer with timestamp
                this.addFooter(doc);

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    addHeader(doc, trip) {
        // Logo area (placeholder)
        doc.fontSize(24)
           .font('Helvetica-Bold')
           .fillColor('#2E8B8B')
           .text('FrozenShield', 50, 50);

        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#666666')
           .text('Plan. Protect. Explore the North.', 50, 80);

        doc.moveDown(0.5);

        // Title
        doc.fontSize(20)
           .font('Helvetica-Bold')
           .fillColor('#0B1A2B')
           .text('TRIP PLAN', 50, 110, { align: 'center' });

        doc.fontSize(16)
           .font('Helvetica')
           .text(trip.title, { align: 'center' });

        // Line separator
        doc.moveTo(50, 160)
           .lineTo(545, 160)
           .strokeColor('#2E8B8B')
           .lineWidth(2)
           .stroke();

        doc.moveDown(2);
    }

    addEmergencyContacts(doc, contacts) {
        const y = doc.y;

        // Red box for emergency contacts
        doc.rect(50, y, 495, 100)
           .fillAndStroke('#FEE2E2', '#DC2626')
           .lineWidth(2);

        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#DC2626')
           .text('EMERGENCY CONTACTS', 60, y + 10);

        if (contacts && contacts.length > 0) {
            let yPos = y + 35;
            doc.fontSize(11)
               .font('Helvetica')
               .fillColor('#000000');

            contacts.forEach((contact, index) => {
                if (index < 3) { // Limit to 3 contacts in PDF
                    doc.text(`${contact.name}: ${contact.phone}${contact.relationship ? ` (${contact.relationship})` : ''}`,
                            60, yPos);
                    if (contact.email) {
                        doc.fontSize(9)
                           .fillColor('#666666')
                           .text(`Email: ${contact.email}`, 60, yPos + 12);
                    }
                    yPos += 25;
                }
            });
        } else {
            doc.fontSize(11)
               .font('Helvetica-Oblique')
               .fillColor('#666666')
               .text('No emergency contacts specified', 60, y + 35);
        }

        doc.y = y + 110;
        doc.moveDown();
    }

    addTripOverview(doc, trip) {
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#0B1A2B')
           .text('Trip Overview', 50, doc.y);

        doc.moveDown(0.5);

        const overview = [
            { label: 'Activity Type', value: trip.activity_type },
            { label: 'Start Date', value: moment(trip.start_date).tz('America/Yellowknife').format('MMMM DD, YYYY - HH:mm') },
            { label: 'End Date', value: moment(trip.end_date).tz('America/Yellowknife').format('MMMM DD, YYYY - HH:mm') },
            { label: 'Duration', value: trip.estimated_duration ? `${Math.floor(trip.estimated_duration / 60)} hours ${trip.estimated_duration % 60} minutes` : 'Not specified' },
            { label: 'Difficulty', value: trip.difficulty_level || 'Not specified' },
            { label: 'Group Size', value: trip.group_size || 1 },
            { label: 'Status', value: trip.status.toUpperCase() }
        ];

        doc.fontSize(10)
           .font('Helvetica');

        overview.forEach(item => {
            doc.fillColor('#666666')
               .text(`${item.label}:`, 60, doc.y, { continued: true })
               .fillColor('#000000')
               .font('Helvetica-Bold')
               .text(` ${item.value}`, { continued: false });
            doc.font('Helvetica');
        });

        doc.moveDown();
    }

    addRouteInformation(doc, trip) {
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#0B1A2B')
           .text('Route Information', 50, doc.y);

        doc.moveDown(0.5);
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#000000');

        // Start location
        if (trip.start_location) {
            doc.fillColor('#666666')
               .text('Start Location:', 60, doc.y);
            doc.fillColor('#000000')
               .text(`Lat: ${trip.start_location.lat || trip.start_location[1]}, Lng: ${trip.start_location.lng || trip.start_location[0]}`, 70, doc.y);
            if (trip.start_location.name) {
                doc.text(trip.start_location.name, 70, doc.y);
            }
        }

        // End location
        if (trip.end_location) {
            doc.moveDown(0.5);
            doc.fillColor('#666666')
               .text('End Location:', 60, doc.y);
            doc.fillColor('#000000')
               .text(`Lat: ${trip.end_location.lat || trip.end_location[1]}, Lng: ${trip.end_location.lng || trip.end_location[0]}`, 70, doc.y);
            if (trip.end_location.name) {
                doc.text(trip.end_location.name, 70, doc.y);
            }
        }

        // Checkpoints
        if (trip.checkpoints && trip.checkpoints.length > 0) {
            doc.moveDown();
            doc.fillColor('#666666')
               .text('Checkpoints:', 60, doc.y);

            trip.checkpoints.forEach((checkpoint, index) => {
                doc.fillColor('#000000')
                   .text(`${index + 1}. ${checkpoint.name || `Checkpoint ${index + 1}`}`, 70, doc.y);

                if (checkpoint.expected_time) {
                    doc.fontSize(9)
                       .fillColor('#666666')
                       .text(`Expected: ${moment(checkpoint.expected_time).format('MMM DD, HH:mm')}`, 80, doc.y);
                }

                if (checkpoint.location) {
                    doc.text(`Coordinates: ${checkpoint.location.lat || checkpoint.location[1]}, ${checkpoint.location.lng || checkpoint.location[0]}`, 80, doc.y);
                }
                doc.fontSize(10);
            });
        }

        doc.moveDown();
    }

    addEquipmentList(doc, equipment) {
        // Check if we need a new page
        if (doc.y > 600) {
            doc.addPage();
        }

        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#0B1A2B')
           .text('Equipment Checklist', 50, doc.y);

        doc.moveDown(0.5);

        if (equipment && equipment.length > 0) {
            doc.fontSize(10)
               .font('Helvetica')
               .fillColor('#000000');

            // Create two columns for equipment
            const columnWidth = 230;
            const leftColumn = 60;
            const rightColumn = leftColumn + columnWidth + 20;
            const itemsPerColumn = Math.ceil(equipment.length / 2);
            let currentY = doc.y;

            equipment.forEach((item, index) => {
                const x = index < itemsPerColumn ? leftColumn : rightColumn;
                const y = index < itemsPerColumn ?
                    currentY + (index * 15) :
                    currentY + ((index - itemsPerColumn) * 15);

                // Checkbox
                doc.rect(x, y, 10, 10)
                   .stroke();

                // Item text
                doc.text(item.name || item, x + 15, y);
            });

            doc.y = currentY + Math.ceil(equipment.length / 2) * 15 + 10;
        } else {
            doc.fontSize(10)
               .font('Helvetica-Oblique')
               .fillColor('#666666')
               .text('No equipment list specified', 60, doc.y);
        }

        doc.moveDown();
    }

    addParticipants(doc, participants) {
        if (!participants || participants.length === 0) return;

        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#0B1A2B')
           .text('Participants', 50, doc.y);

        doc.moveDown(0.5);
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#000000');

        participants.forEach(participant => {
            const roleLabel = participant.role === 'leader' ? ' (Leader)' :
                            participant.role === 'emergency_contact' ? ' (Emergency Contact)' : '';

            doc.text(`• ${participant.username}${roleLabel} - ${participant.status}`, 60, doc.y);
            if (participant.email) {
                doc.fontSize(9)
                   .fillColor('#666666')
                   .text(`  ${participant.email}`, 70, doc.y);
                doc.fontSize(10)
                   .fillColor('#000000');
            }
        });

        doc.moveDown();
    }

    addWeatherInfo(doc, weather) {
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#0B1A2B')
           .text('Weather Conditions', 50, doc.y);

        doc.moveDown(0.5);
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#000000');

        if (typeof weather === 'object') {
            Object.entries(weather).forEach(([key, value]) => {
                doc.fillColor('#666666')
                   .text(`${key}:`, 60, doc.y, { continued: true })
                   .fillColor('#000000')
                   .text(` ${value}`, { continued: false });
            });
        } else {
            doc.text(weather, 60, doc.y);
        }

        doc.moveDown();
    }

    addNotes(doc, notes) {
        // Check if we need a new page
        if (doc.y > 650) {
            doc.addPage();
        }

        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#0B1A2B')
           .text('Additional Notes', 50, doc.y);

        doc.moveDown(0.5);
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#000000')
           .text(notes, 60, doc.y, {
               width: 485,
               align: 'left'
           });

        doc.moveDown();
    }

    addFooter(doc) {
        const bottomY = doc.page.height - 50;

        // Line separator
        doc.moveTo(50, bottomY - 20)
           .lineTo(545, bottomY - 20)
           .strokeColor('#CCCCCC')
           .lineWidth(1)
           .stroke();

        doc.fontSize(8)
           .font('Helvetica')
           .fillColor('#666666')
           .text(`Generated by FrozenShield on ${moment().tz('America/Yellowknife').format('MMMM DD, YYYY at HH:mm')}`,
                50, bottomY - 10, { align: 'center' });

        doc.text('Always verify conditions and carry appropriate safety equipment',
                50, bottomY, { align: 'center' });
    }
}

const exportService = new ExportService();
module.exports = { exportService };