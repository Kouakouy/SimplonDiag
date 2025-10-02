"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDemoUsers = initializeDemoUsers;
const db_1 = require("../config/db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function initializeDemoUsers() {
    try {
        const db = await (0, db_1.getDb)();
        const users = db.collection('users');
        // Vérifier si les utilisateurs existent déjà
        const existingUsers = await users.find({}).toArray();
        if (existingUsers.length > 0) {
            console.log('Users already exist, skipping initialization');
            return;
        }
        // Créer les utilisateurs de démonstration
        const demoUsers = [
            {
                name: 'Admin Simplon',
                email: 'admin@simplon.com',
                password_hash: await bcryptjs_1.default.hash('password123', 10),
                role: 'admin',
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                name: 'Observateur Simplon',
                email: 'observer@simplon.com',
                password_hash: await bcryptjs_1.default.hash('password123', 10),
                role: 'observer',
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                name: 'Créateur Simplon',
                email: 'creator@simplon.com',
                password_hash: await bcryptjs_1.default.hash('password123', 10),
                role: 'creator',
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ];
        await users.insertMany(demoUsers);
        console.log('Demo users initialized successfully');
    }
    catch (error) {
        console.error('Error initializing demo users:', error);
    }
}
// Exécuter seulement si ce fichier est appelé directement
if (require.main === module) {
    initializeDemoUsers().then(() => {
        console.log('Initialization complete');
        process.exit(0);
    });
}
