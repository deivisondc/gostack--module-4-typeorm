import { query } from "express";
import {MigrationInterface, QueryRunner, Table, TableForeignKey} from "typeorm";

export class AddOrderProduct1612019488134 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.createTable(
        new Table({
          name: 'orders_products',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,

            },
            {
              name: 'order_id',
              type: 'uuid',
            },
            {
              name: 'product_id',
              type: 'uuid',
            },
            {
              name: 'price',
              type: 'decimal',
              isNullable: false,
              default: 0.00,
            },
            {
              name: 'quantity',
              type: 'integer',
              isNullable: false,
              default: 0,
            },
            {
              name: 'created_at',
              type: 'timestamp',
              default: 'now()',
            },
            {
              name: 'updated_at',
              type: 'timestamp',
              default: 'now()',
            },
          ]
        })
      );

      await queryRunner.createForeignKey(
        'orders_products',
        new TableForeignKey({
          name: 'FK_OrdersProductsToOrder',
          columnNames: ['order_id'],
          referencedTableName: 'orders',
          referencedColumnNames: ['id'],
        })
      );

      await queryRunner.createForeignKey(
        'orders_products',
        new TableForeignKey({
          name: 'FK_OrdersProductsToProduct',
          columnNames: ['product_id'],
          referencedTableName: 'products',
          referencedColumnNames: ['id'],
        })
      );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropForeignKey('orders_products', 'FK_OrdersProductsToOrder');
      await queryRunner.dropForeignKey('orders_products', 'FK_OrdersProductsToProduct');

      await queryRunner.dropTable('orders_products');
    }

}
