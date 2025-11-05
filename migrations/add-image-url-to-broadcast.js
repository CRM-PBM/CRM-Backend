/**
 * Migration: Add image_url column to broadcast table
 * 
 * Untuk menjalankan migration:
 * npx sequelize-cli db:migrate
 * 
 * Untuk rollback:
 * npx sequelize-cli db:migrate:undo
 */

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if column already exists
      const table = await queryInterface.describeTable('broadcast');
      if (table.image_url) {
        console.log('Column image_url already exists, skipping...');
        return;
      }

      // Add image_url column
      await queryInterface.addColumn('broadcast', 'image_url', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'URL gambar untuk attachment (jika ada)'
      });

      console.log('✅ Column image_url successfully added to broadcast table');
    } catch (error) {
      console.error('❌ Migration error:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Check if column exists
      const table = await queryInterface.describeTable('broadcast');
      if (!table.image_url) {
        console.log('Column image_url does not exist, skipping...');
        return;
      }

      // Remove image_url column
      await queryInterface.removeColumn('broadcast', 'image_url');

      console.log('✅ Column image_url successfully removed from broadcast table');
    } catch (error) {
      console.error('❌ Rollback error:', error);
      throw error;
    }
  }
};
