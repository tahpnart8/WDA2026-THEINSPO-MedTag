const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportTable(tableName, findManyArgs = {}) {
    const data = await prisma[tableName].findMany(findManyArgs);
    if (data.length === 0) return '';

    const columns = Object.keys(data[0]);
    let sql = `-- Data for table ${tableName}\n`;

    for (const row of data) {
        const values = columns.map(col => {
            const val = row[col];
            if (val === null) return 'NULL';
            if (val instanceof Date) return `'${val.toISOString()}'`;
            if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            return val;
        });
        sql += `INSERT INTO "${tableName}" ("${columns.join('", "')}") VALUES (${values.join(', ')});\n`;
    }
    return sql + '\n';
}

async function main() {
    console.log('Starting database export...');

    try {
        let fullSql = `-- MedTag Database Dump\n`;
        fullSql += `-- Generated at: ${new Date().toISOString()}\n\n`;

        // Order is important for foreign key constraints
        fullSql += await exportTable('User');
        fullSql += await exportTable('MedicalRecord');
        fullSql += await exportTable('Device');
        fullSql += await exportTable('EmergencyLog');
        fullSql += await exportTable('AuditLog');

        const dbDir = path.join(__dirname, 'database');
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir);
        }

        fs.writeFileSync(path.join(dbDir, 'full_dump.sql'), fullSql);
        console.log('Export completed successfully: database/full_dump.sql');
    } catch (error) {
        console.error('Export failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
