-- Enable RLS on core tables
ALTER TABLE public."Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Table" ENABLE ROW LEVEL SECURITY;

-- Admin / account_manager full access policies
CREATE POLICY admin_access_order
    ON public."Order"
    FOR ALL USING (auth.role() IN ('admin', 'account_manager'));

CREATE POLICY admin_access_order_item
    ON public."OrderItem"
    FOR ALL USING (auth.role() IN ('admin', 'account_manager'));

CREATE POLICY admin_access_table
    ON public."Table"
    FOR ALL USING (auth.role() IN ('admin', 'account_manager'));

-- Customer policies (access only own orders)

-- SELECT – customers can only read their own orders
CREATE POLICY customer_order_select
    ON public."Order"
    FOR SELECT USING ("customerId"::uuid = auth.uid());

-- INSERT – customers can only insert rows that reference themselves
CREATE POLICY customer_order_insert
    ON public."Order"
    FOR INSERT WITH CHECK ("customerId"::uuid = auth.uid());

-- UPDATE – customers can only modify rows that belong to them
CREATE POLICY customer_order_update
    ON public."Order"
    FOR UPDATE USING ("customerId"::uuid = auth.uid());

-- DELETE – customers can only delete rows that belong to them
CREATE POLICY customer_order_delete
    ON public."Order"
    FOR DELETE USING ("customerId"::uuid = auth.uid());

-- OrderItem inherits customer restriction via Order
CREATE POLICY customer_orderitem_select
    ON public."OrderItem"
    FOR SELECT USING (
        EXISTS (
            SELECT 1
            FROM public."Order" o
            WHERE o.id = "orderId"::uuid
            AND o."customerId"::uuid = auth.uid()
        )
    );

CREATE POLICY customer_orderitem_insert
    ON public."OrderItem"
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public."Order" o
            WHERE o.id::uuid = "orderId"::uuid
            AND o."customerId"::uuid = auth.uid()
        )
    );

CREATE POLICY customer_orderitem_update
    ON public."OrderItem"
    FOR UPDATE USING (
        EXISTS (
            SELECT 1
            FROM public."Order" o
            WHERE o.id = "orderId"::uuid
            AND o."customerId"::uuid = auth.uid()
        )
    );

CREATE POLICY customer_orderitem_delete
    ON public."OrderItem"
    FOR DELETE USING (
        EXISTS (
            SELECT 1
            FROM public."Order" o
            WHERE o.id = "orderId"::uuid
              AND o."customerId"::uuid = auth.uid()
        )
    );

-- Waiter policies (can read/write orders and order items)
CREATE POLICY waiter_order_all
    ON public."Order"
    FOR ALL USING (auth.role() = 'waiter');

CREATE POLICY waiter_orderitem_all
    ON public."OrderItem"
    FOR ALL USING (auth.role() = 'waiter');

-- Waiter can update table status (but not other columns)
CREATE POLICY waiter_table_status
    ON public."Table"
    FOR UPDATE USING (auth.role() = 'waiter');