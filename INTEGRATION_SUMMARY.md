# Virtual Pantry Integration Summary

## Overview
Successfully connected the virtual pantry application's receipt scanning functionality with the backend, AI classification, OpenFoodFacts API, and database storage.

## Changes Made

### 1. Backend Changes

#### New File: `Backend/app/utils/openfoodfacts.py`
- Created utility function `get_product_image_from_openfoodfacts(product_name)`
- Searches OpenFoodFacts API for product images
- Returns image URL if found, None otherwise
- Handles errors gracefully with timeout protection

#### Updated: `Backend/app/routes.py`
- **Import Added**: `from app.utils.openfoodfacts import get_product_image_from_openfoodfacts`
- **Updated `/upload-receipt` endpoint**:
  - Now processes receipt through complete flow:
    1. Sends to Asprise OCR API
    2. Classifies items using AI model
    3. Fetches product images from OpenFoodFacts
    4. Stores items in database (PantryItems table)
    5. Returns grouped items by storage location
  - Handles existing items by updating quantities
  - Filters out non-food items (based on AI classification)
  - Groups items by storage (Fridge, Pantry, Freezer)
  
- **New `/pantry_items/{user_id}` GET endpoint**:
  - Retrieves all pantry items for a user
  - Groups items by storage location
  - Returns formatted data for frontend display

### 2. Frontend Changes

#### Updated: `Frontend/src/services/api.ts`
- **Enhanced `uploadReceipt` function**:
  - Added authentication header with Google ID token
  - Sends receipt image to backend
  
- **New `getPantryItems` function**:
  - Fetches pantry items for a specific user
  - Includes authentication

#### Updated: `Frontend/src/config/consts.ts`
- Changed `GET_PANTRY` route from `/pantry` to `/pantry_items`

#### Updated: `Frontend/src/components/CameraModal/CameraModal.tsx`
- Added `onUploadSuccess` callback prop
- Added `isUploading` state for loading indication
- **Enhanced `usePhoto` function**:
  - Converts captured base64 image to File object
  - Uploads to backend via `uploadReceipt` API
  - Calls success callback on completion
  - Shows error alert on failure
  - Disables buttons during upload
  - Shows "Uploading..." text during upload

#### Updated: `Frontend/src/components/NavigationBar/BottomNavBar/BottomNavBar.tsx`
- Added `handleUploadSuccess` function
- Navigates to pantry page after successful upload
- Passes `onUploadSuccess` callback to CameraModal

#### Updated: `Frontend/src/pages/PantryPage/PantryPage.tsx`
- Replaced mock data with real API calls
- Added `useEffect` to fetch pantry data on mount
- Added loading and error states
- Fetches user ID from localStorage
- Calls `getPantryItems` API
- Transforms API response to component format
- Shows appropriate messages for empty pantry or errors

## Data Flow

```
1. User captures receipt photo in CameraModal
   ↓
2. Photo converted to File and sent to /upload-receipt endpoint
   ↓
3. Backend processes receipt:
   - Asprise OCR extracts text
   - AI model classifies items (food/non-food, category, storage)
   - OpenFoodFacts API fetches product images
   - Items stored in PantryItems database table
   ↓
4. Backend returns processed items grouped by storage
   ↓
5. Frontend navigates to PantryPage
   ↓
6. PantryPage fetches all user's pantry items
   ↓
7. Items displayed in ItemSection components grouped by storage
```

## API Response Format

### `/upload-receipt` Response:
```json
{
  "status": "success",
  "items": [
    {
      "id": 1,
      "name": "Milk",
      "qty": "x2",
      "image": "https://...",
      "category": "Dairy",
      "storage": "Fridge"
    }
  ],
  "grouped_items": {
    "Fridge": [
      {"id": 1, "name": "Milk", "qty": "x2", "image": "https://..."}
    ],
    "Pantry": [...],
    "Freezer": [...]
  },
  "total_items": 5
}
```

### `/pantry_items/{user_id}` Response:
```json
{
  "status": "success",
  "grouped_items": {
    "Fridge": [...],
    "Pantry": [...],
    "Freezer": [...]
  },
  "total_items": 10
}
```

## Database Schema Used

### PantryItems Table:
- `id`: Primary key
- `user_id`: Foreign key to Users table
- `item_name`: Name of the food item
- `category`: Food category (from AI model)
- `storage`: Storage location (Fridge/Pantry/Freezer)
- `quantity_value`: Numeric quantity
- `quantity_unit`: Unit of measurement
- `item_image`: URL to product image
- `added_on`: Timestamp

## Features Implemented

✅ Receipt photo capture via camera
✅ Receipt upload to backend with authentication
✅ AI classification of food items
✅ OpenFoodFacts image fetching
✅ Database storage of pantry items
✅ Duplicate item handling (quantity updates)
✅ Non-food item filtering
✅ Storage location grouping
✅ Real-time pantry display
✅ Loading and error states
✅ User authentication integration

## Testing Checklist

- [ ] Test receipt upload with valid receipt
- [ ] Test with multiple items
- [ ] Test with duplicate items (should update quantity)
- [ ] Test with non-food items (should be filtered)
- [ ] Test OpenFoodFacts image fetching
- [ ] Test pantry page data loading
- [ ] Test with empty pantry
- [ ] Test error handling (network failures)
- [ ] Test authentication (logged in/out states)
- [ ] Test navigation after upload

## Environment Variables Required

Backend `.env`:
```
FOOD_CLASSIFIER_MODEL_URL=http://localhost:9000
```

Frontend `.env`:
```
VITE_API_BASE_URL=http://localhost:8000
```

## Next Steps / Improvements

1. Add item deletion functionality
2. Add manual item editing
3. Add item expiration date tracking
4. Improve image fallback for items not in OpenFoodFacts
5. Add batch item operations
6. Add pantry statistics/analytics
7. Implement item search/filter
8. Add notifications for low stock items
9. Optimize image loading (lazy loading, caching)
10. Add offline support