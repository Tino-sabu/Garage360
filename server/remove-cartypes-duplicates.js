const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://gddblbotzusdpeyedola.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkZGJsYm90enVzZHBleWVkb2xhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIzMDEwNCwiZXhwIjoyMDc2ODA2MTA0fQ.BpvpIXZqulhxIJBz67laJ1TjgKiB3TPM58sIsBR2NGQ'
);

async function removeDuplicates() {
    try {
        console.log('🔍 Fetching all cartypes records...\n');

        const { data: allRecords, error: fetchError } = await supabase
            .from('cartypes')
            .select('*')
            .order('cartype_id');

        if (fetchError) throw fetchError;

        console.log(`📊 Total records: ${allRecords.length}\n`);

        // Group by brand+model to find duplicates
        const seen = new Map();
        const duplicates = [];

        allRecords.forEach(record => {
            const key = `${record.brand}-${record.model}`;
            if (seen.has(key)) {
                // This is a duplicate, mark for deletion
                duplicates.push(record.cartype_id);
                console.log(`🔴 Duplicate found: ${record.brand} ${record.model} (ID: ${record.cartype_id})`);
            } else {
                // First occurrence, keep it
                seen.set(key, record.cartype_id);
                console.log(`✅ Keeping: ${record.brand} ${record.model} (ID: ${record.cartype_id})`);
            }
        });

        console.log(`\n📋 Summary:`);
        console.log(`   Unique records: ${seen.size}`);
        console.log(`   Duplicates to delete: ${duplicates.length}\n`);

        if (duplicates.length > 0) {
            console.log('🗑️  Deleting duplicates...\n');

            for (const id of duplicates) {
                const { error: deleteError } = await supabase
                    .from('cartypes')
                    .delete()
                    .eq('cartype_id', id);

                if (deleteError) {
                    console.error(`❌ Error deleting ID ${id}:`, deleteError.message);
                } else {
                    console.log(`✅ Deleted cartype_id: ${id}`);
                }
            }

            console.log('\n✅ Duplicates removed successfully!\n');

            // Verify final count
            const { count } = await supabase
                .from('cartypes')
                .select('*', { count: 'exact', head: true });

            console.log(`📊 Final record count: ${count}\n`);
        } else {
            console.log('✨ No duplicates found!\n');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

removeDuplicates();
