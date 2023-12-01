import type { Knex } from 'knex';
import { MetaTable } from '~/utils/globals';

const up = async (knex: Knex) => {
  await knex.schema.alterTable(MetaTable.USERS, (table) => {
    table.string('display_name');
    table.string('user_name');
    table.string('tid');
    table.string('uid');
    table.string('avatar');
    table.dropColumn('firstname');
    table.dropColumn('lastname');
    table.dropColumn('username');
  });
};

const down = async (knex: Knex) => {
  await knex.schema.alterTable(MetaTable.USERS, (table) => {
    table.dropColumn('display_name');
    table.dropColumn('user_name');
    table.dropColumn('tid');
    table.dropColumn('uid');
    table.dropColumn('avatar');
    table.string('firstname');
    table.string('lastname');
    table.string('username');
  });
};

export { up, down };
