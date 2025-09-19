# Loading States Implementation Guide

This document provides a comprehensive overview of the loading states implemented across the Agentic Scraper UI application.

## Overview

Loading states have been added to improve user experience by providing visual feedback during API calls and form submissions. The implementation includes reusable components, hooks, and context for consistent loading behavior across the application.

## Components Added

### 1. ButtonLoader Component
**Location**: `src/components/common/ButtonLoader.tsx`

A simple, lightweight loading spinner specifically designed for buttons.

**Props**:
- `loading?: boolean` - Whether to show the loader
- `size?: 'small' | 'medium' | 'large'` - Size of the spinner
- `className?: string` - Additional CSS classes

**Usage**:
```tsx
import ButtonLoader from '../../../components/common/ButtonLoader';

{isLoading && <ButtonLoader loading={true} size="small" />}
```

### 2. InlineLoader Component
**Location**: `src/components/common/InlineLoader.tsx`

A versatile loading component for content areas with multiple variants.

**Props**:
- `size?: 'small' | 'medium' | 'large'` - Size of the loader
- `message?: string` - Loading message text
- `className?: string` - Additional CSS classes
- `variant?: 'spinner' | 'dots' | 'pulse'` - Animation type

**Usage**:
```tsx
import InlineLoader from '../../../components/common/InlineLoader';

<InlineLoader 
  size="medium" 
  message="Loading data..." 
  variant="spinner" 
/>
```

### 3. LoadingButton Component
**Location**: `src/components/common/LoadingButton.tsx`

A comprehensive button component that integrates with PrimeReact Button and includes built-in loading states.

**Props**:
- `loading?: boolean` - Loading state
- `label?: string` - Button text
- `loadingLabel?: string` - Text to show when loading
- `loaderSize?: 'small' | 'medium' | 'large'` - Size of the loader
- `hideIconWhenLoading?: boolean` - Hide button icon during loading
- All standard PrimeReact Button props

**Usage**:
```tsx
import LoadingButton from '../../../components/common/LoadingButton';

<LoadingButton
  type="submit"
  label="Submit"
  loadingLabel="Submitting..."
  loading={isSubmitting}
  disabled={isSubmitting}
  className="btn-submit"
  loaderSize="small"
/>
```

## Hooks

### 1. useLoading Hook
**Location**: `src/hooks/useLoading.ts`

Basic hook for managing single loading state.

**Returns**:
- `isLoading: boolean` - Current loading state
- `startLoading: () => void` - Start loading
- `stopLoading: () => void` - Stop loading
- `withLoading: (asyncFn) => asyncFn` - Wrapper for async functions

**Usage**:
```tsx
import { useLoading } from '../../../hooks/useLoading';

const { isLoading, withLoading } = useLoading();

const handleSubmit = withLoading(async (data) => {
  await apiService.submitData(data);
});
```

### 2. useMultipleLoading Hook
**Location**: `src/hooks/useLoading.ts`

Hook for managing multiple loading states by key.

**Returns**:
- `loadingStates: Record<string, boolean>` - All loading states
- `isLoading: (key: string) => boolean` - Check specific loading state
- `startLoading: (key: string) => void` - Start loading for key
- `stopLoading: (key: string) => void` - Stop loading for key
- `withLoading: (key, asyncFn) => asyncFn` - Wrapper with key

## Context

### LoadingContext
**Location**: `src/context/LoadingContext.tsx`

Global context for managing loading states across the application.

**Provides**:
- `useLoading()` - Access to loading context
- `useApiLoading()` - Convenience hook for API operations
- `useFormLoading(formName)` - Convenience hook for form submissions

**Setup**:
```tsx
import { LoadingProvider } from './context/LoadingContext';

<LoadingProvider>
  <App />
</LoadingProvider>
```

## Components Updated with Loading States

### 1. ScraperForm
**Location**: `src/features/scraper/components/ScraperForm.tsx`

**Loading States Added**:
- Form submission loading state
- Submit button shows loading spinner
- Prevents multiple submissions during API call

**Implementation**:
- Uses `LoadingButton` component
- Manages `isSubmitting` state
- Shows "Submitting..." text during loading

### 2. XmlParseForm
**Location**: `src/features/scraper/components/XmlParseForm.tsx`

**Loading States Added**:
- XML parse request loading state
- Submit button with loading indicator
- Prevents multiple submissions

### 3. Preview Component
**Location**: `src/features/scraper/components/Preview.tsx`

**Loading States Added**:
- Cancel action loading state
- Approve action loading state
- Dynamic button text during actions

**Implementation**:
- Uses `ButtonLoader` for button loading indicators
- Shows "Cancelling..." and "Starting..." text
- Prevents multiple clicks during API calls

### 4. XMLPreviewData Component
**Location**: `src/features/scraper/components/XMLPreviewData.tsx`

**Loading States Added**:
- Cancel button loading state
- Submit button already had loading (enhanced)
- Prevents interactions during API calls

### 5. NewTaskModal
**Location**: `src/features/monitoring/components/NewTaskModal.tsx`

**Loading States Added**:
- Task creation loading state
- Submit button loading indicator
- Form disabled during submission

**Implementation**:
- Uses PrimeReact Button's `loading` prop
- Shows "Creating Task..." text
- Disables form during submission

### 6. DataResultsTable & TaskNameModal
**Location**: `src/features/dashboard/DataResultsTable/` & `src/features/dashboard/TaskNameModal/`

**Loading States Added**:
- Task name submission loading state
- Modal submit button loading indicator
- Prevents modal closure during submission

**Implementation**:
- `DataResultsTable` manages `isSubmittingTaskName` state
- `TaskNameModal` receives loading prop
- Uses PrimeReact Button's `loading` prop

### 7. ExtractedDataModal
**Location**: `src/features/dashboard/components/ExtractedDataModal.tsx`

**Existing Loading States**:
- Data fetching loading spinner
- Loading message: "Loading extracted data..."
- Error handling with loading states

## Existing Loading States

### Components with Pre-existing Loading
1. **ExtractedDataModal** - Already had loading for data fetching
2. **OriginUrlsTable** - Already had loading for table data
3. **DataResultsTable** - Already had loading for button actions
4. **ExtractedDataTable** - Already had loading and export loading states
5. **useScraper Hook** - Already had comprehensive loading states for scraping operations

## Best Practices

### 1. Consistent Loading Patterns
- Use `LoadingButton` for form submissions
- Use `InlineLoader` for content loading
- Use `ButtonLoader` for simple button loading states

### 2. User Experience
- Always provide loading feedback for operations > 200ms
- Use descriptive loading text ("Submitting...", "Creating Task...")
- Disable interactive elements during loading
- Prevent multiple submissions/clicks

### 3. Error Handling
- Always stop loading states in finally blocks
- Provide error feedback when operations fail
- Reset form states appropriately

### 4. Performance
- Use React.memo for loading components when appropriate
- Cleanup loading states on component unmount
- Use context sparingly to avoid unnecessary re-renders

## API Integration

All loading states are integrated with the existing API service (`src/services/api.ts`). The loading indicators activate during:

1. **Form Submissions**:
   - `submitScrapeRequest()`
   - `submitMonitorTask()`
   - `submitTaskName()`
   - `submitPreviewData()`

2. **Data Fetching**:
   - `getExtractedData()`
   - `getUrlList()`
   - `getSamplePreview()`

3. **Real-time Operations**:
   - SSE connections for preview data
   - SSE connections for scraping progress

## Future Enhancements

### Potential Improvements
1. **Global Loading Indicator** - App-wide loading bar for navigation
2. **Progressive Loading** - Skeleton screens for data tables
3. **Retry Mechanisms** - Loading states for retry operations
4. **Timeout Handling** - Loading timeouts with user feedback
5. **Optimistic Updates** - Immediate UI updates with loading fallbacks

### Usage Analytics
Consider tracking loading state duration for:
- Performance monitoring
- User experience optimization
- API response time analysis

## Testing

### Testing Loading States
1. **Unit Tests** - Test loading state transitions
2. **Integration Tests** - Test API call loading states
3. **E2E Tests** - Test user interactions with loading states
4. **Performance Tests** - Ensure loading states don't impact performance

### Manual Testing Checklist
- [ ] All form submissions show loading states
- [ ] Loading states prevent multiple submissions
- [ ] Loading text is descriptive and appropriate
- [ ] Loading states are cleared on success/error
- [ ] Buttons are properly disabled during loading
- [ ] Loading animations are smooth and consistent

## Troubleshooting

### Common Issues
1. **Loading state not clearing** - Check finally blocks in async functions
2. **Multiple submissions** - Ensure proper loading state checks
3. **Styling issues** - Verify CSS imports and class names
4. **Performance issues** - Check for unnecessary re-renders

### Debug Tools
- React DevTools for state inspection
- Network tab for API call monitoring
- Console logging for loading state transitions

This implementation provides a solid foundation for loading states across the application while maintaining consistency and good user experience.