// Quick test script to debug Saju day master calculation
import KoreanLunarCalendar from 'korean-lunar-calendar';

// Test 1: 1998-05-18 (양성결)
const cal1 = new KoreanLunarCalendar();
cal1.setSolarDate(1998, 5, 18);
console.log('1998-05-18 양성결:', JSON.stringify(cal1.getKoreanGapja(), null, 2));

// Test 2: 1993-08-02 (김영광)
const cal2 = new KoreanLunarCalendar();
cal2.setSolarDate(1993, 8, 2);
console.log('1993-08-02 김영광:', JSON.stringify(cal2.getKoreanGapja(), null, 2));

// Debug: Check what the raw output looks like
console.log('\n=== Raw Info ===');
console.log('1998-05-18 day string:', cal1.getKoreanGapja().day);
console.log('1993-08-02 day string:', cal2.getKoreanGapja().day);
