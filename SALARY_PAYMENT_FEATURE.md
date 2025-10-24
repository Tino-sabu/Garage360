# Salary Payment Feature & Input Fix

## Changes Made

### 1. **Fixed Input Field Visibility** ✅
   - **Issue**: Hourly rate input field was not visible when editing
   - **Solution**: Changed from generic `input` class to explicit styling:
     ```javascript
     className="w-full bg-dark-700 border border-dark-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
     ```
   - **Result**: Input now clearly visible with white text on dark background

### 2. **Pay Salary Feature** ✅

#### A. Salary Calculation
   - **Formula**: `Total Salary = Time-based Pay + Bonus`
   - **Time-based Pay**: `Σ(estimated_time × hourly_rate)` for all completed jobs
   - **Bonus**: `Σ(3% × job_cost)` for all completed jobs
   - **Auto-calculated** when page loads

#### B. Total Salary Card (Right Column)
   - **Display**: Large yellow card showing total salary due
   - **Components**:
     - Icon: Dollar sign (yellow)
     - Amount: Total calculated salary
     - Label: "Total Salary Due - Time-based + Bonus"
     - Button: "Pay Salary" (green)
   - **Position**: Above the bonus card

#### C. Pay Salary Modal
   - **Trigger**: Click "Pay Salary" button
   - **Features**:
     1. **Header**: Green border, mechanic name displayed
     2. **Salary Breakdown Section**:
        - Lists each completed job
        - Shows: Service name, time × rate calculation, time-based pay, bonus
        - Scrollable if many jobs
        - Summary totals at bottom
     3. **Editable Amount Section**:
        - Large input field to adjust final payment
        - Pre-filled with calculated total
        - Can be manually edited before payment
        - Validation: Must be positive number
     4. **Action Buttons**:
        - Cancel: Close modal without action
        - Process Payment: Shows final amount to be paid

#### D. Enhanced Completed Jobs Display
   - **Added Information**:
     - Estimated time (with clock icon)
     - Time-based pay calculation
     - Bonus amount
   - **Layout**: Shows all payment components per job

## UI Components Added

### State Variables
```javascript
const [totalSalary, setTotalSalary] = useState(0);
const [showPaySalary, setShowPaySalary] = useState(false);
const [editableSalary, setEditableSalary] = useState(0);
```

### Calculation Logic
```javascript
// Time-based salary
const timeBasedSalary = completed.reduce((sum, job) => {
    const estimatedTime = parseFloat(job.estimated_time) || 0;
    return sum + (estimatedTime * hourlyRate);
}, 0);

// Total salary
const calculatedSalary = timeBasedSalary + totalBonus;
setTotalSalary(calculatedSalary);
setEditableSalary(calculatedSalary);
```

## Example Calculation

### Mechanic: Vinod Mathew
- **Hourly Rate**: ₹350/hr

### Completed Jobs:
1. **Engine Repair**
   - Estimated Time: 4 hours
   - Time-based Pay: 4 × ₹350 = ₹1,400
   - Job Cost: ₹10,000
   - Bonus (3%): ₹300
   - **Subtotal**: ₹1,700

2. **Oil Change**
   - Estimated Time: 1 hour
   - Time-based Pay: 1 × ₹350 = ₹350
   - Job Cost: ₹2,000
   - Bonus (3%): ₹60
   - **Subtotal**: ₹410

3. **Brake Service**
   - Estimated Time: 2.5 hours
   - Time-based Pay: 2.5 × ₹350 = ₹875
   - Job Cost: ₹5,000
   - Bonus (3%): ₹150
   - **Subtotal**: ₹1,025

### Total Salary Due:
- **Time-based Pay**: ₹2,625 (7.5 hours)
- **Bonus**: ₹510 (3% of ₹17,000)
- **TOTAL**: ₹3,135

## User Flow

### For Managers:

1. **View Salary**:
   - Navigate to mechanic detail page
   - See "Total Salary Due" card in right column
   - Amount automatically calculated

2. **Review Breakdown**:
   - Click "Pay Salary" button
   - Modal opens with detailed breakdown
   - Each job shows time calculation and bonus

3. **Adjust Amount (Optional)**:
   - Edit the final amount field if needed
   - Can increase/decrease based on deductions or bonuses
   - Input validates positive numbers

4. **Process Payment**:
   - Click "Process Payment" button
   - Shows confirmation with final amount
   - Modal closes after success

## Color Coding

- **Yellow**: Total salary (main payment)
- **Blue**: Time-based pay components
- **Green**: Bonus components
- **White**: Job costs/base information

## Data Requirements

### service_requests Table Fields Used:
- `estimated_time` (decimal/float) - Hours estimated for job
- `final_cost` or `estimated_cost` - Job cost for bonus calculation
- `status` - Must be 'completed'
- `completion_date` - Optional, for display

### Example Data:
```sql
-- service_requests table
request_id | mechanic_id | estimated_time | estimated_cost | final_cost | status
1          | 2           | 4.0            | 10000          | 10000      | completed
2          | 2           | 1.0            | 2000           | 2000       | completed
3          | 2           | 2.5            | 5000           | 5000       | completed
```

## Benefits

1. **Transparent**: Clear breakdown of all salary components
2. **Flexible**: Manager can adjust final amount
3. **Comprehensive**: Includes both time-based pay and performance bonus
4. **Fair**: 3% bonus incentivizes quality work and customer satisfaction
5. **Detailed**: Shows per-job calculations for accountability

## Future Enhancements (Optional)

1. Record payment history in database
2. Generate payment receipts/invoices
3. Track payment dates and periods
4. Add deductions section (taxes, advances, etc.)
5. Export payment reports
6. Send payment notifications to mechanic
7. Integration with accounting systems
8. Bank transfer automation

## Testing Checklist

- [ ] Input field shows white text when editing hourly rate
- [ ] Total salary card displays correct calculation
- [ ] Pay Salary button opens modal
- [ ] Breakdown shows all completed jobs
- [ ] Time-based pay calculated correctly (time × rate)
- [ ] Bonus calculated correctly (3% of cost)
- [ ] Total matches sum of time-based + bonus
- [ ] Editable amount field is visible and functional
- [ ] Can adjust amount up and down
- [ ] Process Payment button shows updated amount
- [ ] Payment confirmation displays correct amount
- [ ] Completed jobs list shows time and pay breakdown

## Notes

- Salary automatically recalculates when hourly rate is updated
- Only "completed" status jobs are included
- If `estimated_time` is missing or 0, time-based pay = 0
- If `final_cost` missing, uses `estimated_cost` for bonus
- All monetary values display with ₹ symbol
- Amounts formatted to 2 decimal places
