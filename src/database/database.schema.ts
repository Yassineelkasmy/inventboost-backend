import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

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


export const users = pgTable('users', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    extAuthId: varchar('ext_auth_id', { length: 255 }).notNull().unique(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    firstName: varchar('first_name', { length: 255 }),
    lastName: varchar('last_name', { length: 255 }),
    phoneNumber: varchar('phone_number', { length: 20 }),
    accessCode: varchar('access_code', { length: 255 }),
    memberId: varchar('member_id'),
    groupNumber: varchar('group_number'),
    benefitCard: varchar('benefit_card'),
    providerId: uuid('provider_id').references(() => providers.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
});

export const userProfiles = pgTable('user_profiles', {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    accessCode: varchar('access_code', { length: 255 }).notNull(),
    memberId: varchar('member_id', { length: 255 }),
    groupNumber: varchar('group_number', { length: 255 }),
    benefitCard: varchar('benefit_card', { length: 255 }),
    createdAt: timestamp('created_at', { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
});


export const usersRelations = relations(users, ({ one, many }) => ({
    provider: one(providers, {
        fields: [users.providerId],
        references: [providers.id],
    }),
    profiles: many(userProfiles),
}));

export const providersRelations = relations(providers, ({ many }) => ({
    users: many(users),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
    user: one(users, {
        fields: [userProfiles.userId],
        references: [users.id],
    }),
}));

export const databaseSchema = {
    providers,
    userProfiles,
    users,
};
