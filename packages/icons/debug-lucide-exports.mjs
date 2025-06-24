import * as lucide from 'lucide-react';

console.log('Available exports in lucide-react:');
console.log(Object.keys(lucide).sort());
console.log('\nTotal exports:', Object.keys(lucide).length);

// Check for dynamic-related exports
const dynamicKeys = Object.keys(lucide).filter(key =>
    key.toLowerCase().includes('dynamic') ||
    key.toLowerCase().includes('import') ||
    key.toLowerCase().includes('load')
);
console.log('\nDynamic-related exports:', dynamicKeys);

// Check if icons is available
if (lucide.icons) {
    console.log('\nlucide.icons available, keys:', Object.keys(lucide.icons).slice(0, 10));
    console.log('Total icons in lucide.icons:', Object.keys(lucide.icons).length);
}

// Test direct icon access
console.log('\nDirect icon test:');
console.log('Activity available:', typeof lucide.Activity);
console.log('Home available:', typeof lucide.Home);
