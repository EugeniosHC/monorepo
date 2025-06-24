import { dynamicIconImports } from 'lucide-react';

console.log('dynamicIconImports available:', typeof dynamicIconImports);
console.log('Sample keys:', Object.keys(dynamicIconImports).slice(0, 10));
console.log('Total icons:', Object.keys(dynamicIconImports).length);

// Test loading a specific icon
try {
    const iconModule = await dynamicIconImports.Activity();
    console.log('Activity icon loaded:', typeof iconModule.default);
} catch (error) {
    console.log('Error loading Activity icon:', error.message);
}
