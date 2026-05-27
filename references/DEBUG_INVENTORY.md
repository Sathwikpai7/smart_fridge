# Debugging Inventory Blank Screen

## Steps to Debug:

1. **Open Browser Console (F12)**
   - Check for any JavaScript errors
   - Look for the console.log messages:
     - "Inventory component rendered"
     - "Inventory items state:"
     - "Inventory loading:"
     - "Inventory error:"

2. **Check Network Tab**
   - Open Network tab in DevTools
   - Refresh the page
   - Look for request to `http://localhost:4000/api/food-items`
   - Check if it returns 200 OK with `[]` (empty array)

3. **Verify Backend is Running**
   ```powershell
   # In PowerShell
   Test-NetConnection -ComputerName localhost -Port 4000
   ```

4. **Check React DevTools**
   - Install React DevTools extension
   - Check if Inventory component is mounted
   - Check component props and state

5. **Common Issues:**
   - **CORS Error**: Backend not allowing frontend origin
   - **Network Error**: Backend not running or wrong port
   - **React Error**: Component crashing during render
   - **CSS Issue**: Component rendering but invisible

## Quick Test:

Add this to the top of the Inventory component return:

```tsx
return (
  <div>
    <h1>TEST - Inventory Page</h1>
    <p>If you see this, the component is rendering</p>
    {/* ... rest of component */}
  </div>
);
```

If you see "TEST - Inventory Page", the component is rendering but something else is wrong.
If you don't see it, the component isn't rendering at all (routing issue or component crash).

