import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    extAuthId: varchar('ext_auth_id', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    fullName: varchar('first_name', { length: 255 }).notNull(),
    accessCode: varchar('access_code', { length: 255 }).notNull(),
    phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
    memberId: varchar('member_id'),
    groupNumber: varchar('group_number'),
    benefitCard: varchar('group_number'),
    providerId: uuid('provider_id').references(() => providers.id, { onDelete: 'set null' }), // Foreign key
    createdAt: timestamp('created_at', { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
});

export const providers = pgTable('providers', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
});

export const databaseSchema = {
    users,
    providers,
};
