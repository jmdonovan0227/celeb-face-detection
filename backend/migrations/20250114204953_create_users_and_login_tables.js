/**
 */
export async function up(knex) {
    return knex.schema.createTable('login', function(table) {
        table.increments('id').primary();
        table.string('hash', 200).notNullable();
        table.text('email').unique().notNullable();
        table.text('reset_token').unique();
        table.timestamp('reset_expiration');
    })
    .createTable('users', function(table) {
        table.increments('id').primary();
        table.string('name', 31);
        table.text('email').unique().notNullable();
        table.bigInteger('entries').defaultTo(0);
        table.timestamp('joined').notNullable();
        table.integer('age').defaultTo(0);
        table.string('image_key', 200).unique();
    });
};

/**
 */
export async function down(knex) {
  return knex.schema.dropTable('login').dropTable('users');
};