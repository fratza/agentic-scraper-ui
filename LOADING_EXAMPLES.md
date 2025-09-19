# Loading Components Usage Examples

This document provides practical examples of how to use the new loading components in your React components.

## Table of Contents
- [ButtonLoader Examples](#buttonloader-examples)
- [InlineLoader Examples](#inlineloader-examples)
- [LoadingButton Examples](#loadingbutton-examples)
- [Loading Context Examples](#loading-context-examples)
- [API Integration Examples](#api-integration-examples)
- [Best Practices](#best-practices)

## ButtonLoader Examples

### Basic Button Loading
```tsx
import React, { useState } from 'react';
import ButtonLoader from '../../../components/common/ButtonLoader';

const MyComponent = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await someApiCall();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button onClick={handleClick} disabled={isLoading}>
      {isLoading && <ButtonLoader loading={true} size="small" />}
      <span>{isLoading ? 'Processing...' : 'Click Me'}</span>
    </button>
  );
};
```

### Different Sizes
```tsx
// Small spinner for compact buttons
<ButtonLoader loading={true} size="small" />

// Medium spinner for regular buttons
<ButtonLoader loading={true} size="medium" />

// Large spinner for prominent buttons
<ButtonLoader loading={true} size="large" />
```

## InlineLoader Examples

### Content Loading
```tsx
import React, { useState, useEffect } from 'react';
import InlineLoader from '../../../components/common/InlineLoader';

const DataComponent = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <InlineLoader message="Loading data..." variant="spinner" />;
  }

  return <div>{/* render data */}</div>;
};
```

### Different Variants
```tsx
// Spinner loader
<InlineLoader variant="spinner" message="Loading..." />

// Dots loader
<InlineLoader variant="dots" message="Please wait..." />

// Pulse loader
<InlineLoader variant="pulse" message="Processing..." />
```

### Modal Loading
```tsx
const MyModal = ({ isLoading }) => (
  <div className="modal">
    {isLoading ? (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <InlineLoader 
          size="large" 
          message="Loading content..." 
          variant="spinner" 
        />
      </div>
    ) : (
      <div>{/* modal content */}</div>
    )}
  </div>
);
```

## LoadingButton Examples

### Form Submission
```tsx
import React, { useState } from 'react';
import LoadingButton from '../../../components/common/LoadingButton';

const FormComponent = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await submitForm(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      
      <LoadingButton
        type="submit"
        label="Submit"
        loadingLabel="Submitting..."
        loading={isSubmitting}
        severity="success"
        className="submit-btn"
        loaderSize="small"
      />
    </form>
  );
};
```

### Action Button with Icon
```tsx
<LoadingButton
  label="Save Data"
  loadingLabel="Saving..."
  icon="pi pi-save"
  loading={isSaving}
  onClick={handleSave}
  severity="info"
  hideIconWhenLoading={false} // Keep icon visible during loading
/>
```

### Danger Action
```tsx
<LoadingButton
  label="Delete Item"
  loadingLabel="Deleting..."
  loading={isDeleting}
  onClick={handleDelete}
  severity="danger"
  className="delete-btn"
  loaderSize="small"
/>
```

## Loading Context Examples

### Using useLoading Hook
```tsx
import React from 'react';
import { useLoading } from '../../../context/LoadingContext';

const MyComponent = () => {
  const { isLoading, withLoading } = useLoading();

  const handleAction = withLoading('myAction', async () => {
    await performAction();
  });

  return (
    <button 
      onClick={handleAction} 
      disabled={isLoading('myAction')}
    >
      {isLoading('myAction') ? 'Processing...' : 'Click Me'}
    </button>
  );
};
```

### Using useApiLoading Hook
```tsx
import React from 'react';
import { useApiLoading } from '../../../context/LoadingContext';

const UserProfile = () => {
  const { isSubmitting, isFetching, withSubmit, withFetch } = useApiLoading();

  const saveProfile = withSubmit('profile', async (profileData) => {
    return await apiService.updateProfile(profileData);
  });

  const loadProfile = withFetch('profile', async (userId) => {
    return await apiService.getProfile(userId);
  });

  return (
    <div>
      {isFetching('profile') && <InlineLoader message="Loading profile..." />}
      
      <LoadingButton
        label="Save Profile"
        loadingLabel="Saving..."
        loading={isSubmitting('profile')}
        onClick={() => saveProfile(profileData)}
      />
    </div>
  );
};
```

### Using useFormLoading Hook
```tsx
import React from 'react';
import { useFormLoading } from '../../../context/LoadingContext';

const ContactForm = () => {
  const { isSubmitting, withSubmit } = useFormLoading('contact');

  const handleSubmit = withSubmit(async (formData) => {
    await apiService.sendMessage(formData);
    showSuccessMessage();
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(formData);
    }}>
      <input type="email" name="email" required />
      <textarea name="message" required />
      
      <LoadingButton
        type="submit"
        label="Send Message"
        loadingLabel="Sending..."
        loading={isSubmitting}
        severity="success"
      />
    </form>
  );
};
```

## API Integration Examples

### Scraper Form with Loading
```tsx
import React, { useState } from 'react';
import apiService from '../../../services/api';
import LoadingButton from '../../../components/common/LoadingButton';

const ScraperForm = ({ onSubmit }) => {
  const [url, setUrl] = useState('');
  const [target, setTarget] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const response = await apiService.submitScrapeRequest({
        url,
        scrapeTarget: target
      });
      
      onSubmit(response);
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter URL"
        disabled={isSubmitting}
      />
      
      <input 
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        placeholder="What to scrape"
        disabled={isSubmitting}
      />
      
      <LoadingButton
        type="submit"
        label="Start Scraping"
        loadingLabel="Starting..."
        loading={isSubmitting}
        disabled={!url || !target}
        severity="info"
      />
    </form>
  );
};
```

### Data Table with Loading States
```tsx
import React, { useState, useEffect } from 'react';
import InlineLoader from '../../../components/common/InlineLoader';
import LoadingButton from '../../../components/common/LoadingButton';

const DataTable = ({ apiEndpoint }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const response = await fetch(apiEndpoint);
      const result = await response.json();
      setData(result.data);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [apiEndpoint]);

  if (loading) {
    return (
      <div className="table-loading">
        <InlineLoader 
          size="large" 
          message="Loading table data..." 
          variant="spinner" 
        />
      </div>
    );
  }

  return (
    <div>
      <div className="table-header">
        <h3>Data Table</h3>
        <LoadingButton
          label="Refresh"
          loadingLabel="Refreshing..."
          icon="pi pi-refresh"
          loading={refreshing}
          onClick={refreshData}
          severity="secondary"
          size="small"
        />
      </div>
      
      <table>
        {/* table content */}
      </table>
    </div>
  );
};
```

### Modal with API Loading
```tsx
import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import InlineLoader from '../../../components/common/InlineLoader';
import LoadingButton from '../../../components/common/LoadingButton';

const EditModal = ({ visible, itemId, onHide, onSave }) => {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && itemId) {
      setLoading(true);
      fetchItem(itemId)
        .then(setItem)
        .finally(() => setLoading(false));
    }
  }, [visible, itemId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveItem(item);
      onSave(item);
      onHide();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog visible={visible} onHide={onHide} header="Edit Item">
      {loading ? (
        <InlineLoader 
          size="medium" 
          message="Loading item details..." 
        />
      ) : (
        <div>
          {/* form fields */}
          
          <div className="modal-footer">
            <LoadingButton
              label="Cancel"
              onClick={onHide}
              severity="secondary"
              disabled={saving}
            />
            <LoadingButton
              label="Save Changes"
              loadingLabel="Saving..."
              loading={saving}
              onClick={handleSave}
              severity="success"
            />
          </div>
        </div>
      )}
    </Dialog>
  );
};
```

## Best Practices

### 1. Consistent Loading Messages
```tsx
// Good: Descriptive and action-specific
<LoadingButton 
  label="Create Account" 
  loadingLabel="Creating account..." 
/>

// Avoid: Generic messages
<LoadingButton 
  label="Submit" 
  loadingLabel="Loading..." 
/>
```

### 2. Proper Error Handling
```tsx
const handleSubmit = async () => {
  setLoading(true);
  try {
    await apiCall();
    // Success handling
  } catch (error) {
    // Error handling
    showErrorMessage(error.message);
  } finally {
    // Always stop loading in finally block
    setLoading(false);
  }
};
```

### 3. Prevent Multiple Submissions
```tsx
const handleSubmit = async () => {
  if (isSubmitting) return; // Prevent multiple submissions
  
  setIsSubmitting(true);
  // ... rest of the logic
};
```

### 4. Accessible Loading States
```tsx
<LoadingButton
  label="Submit"
  loadingLabel="Submitting..."
  loading={isSubmitting}
  aria-label={isSubmitting ? "Submitting form" : "Submit form"}
  aria-describedby={isSubmitting ? "loading-message" : undefined}
/>

{isSubmitting && (
  <span id="loading-message" className="sr-only">
    Your form is being submitted. Please wait.
  </span>
)}
```

### 5. Loading State Cleanup
```tsx
useEffect(() => {
  return () => {
    // Cleanup loading states on unmount
    setLoading(false);
    setSubmitting(false);
  };
}, []);
```

### 6. Conditional Rendering
```tsx
// Good: Use loading states to control UI
{loading ? (
  <InlineLoader message="Loading..." />
) : error ? (
  <ErrorMessage error={error} />
) : (
  <DataComponent data={data} />
)}
```

These examples should help you implement consistent loading states throughout your application. Remember to always provide user feedback for any operation that takes longer than 200ms.