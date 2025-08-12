# Forms Management UI

This directory contains the UI components for managing forms using FormIO and react-hook-form.

## Components

### 1. FormsList.tsx

- Lists all existing forms retrieved from the FormsApi
- Provides actions to edit, delete, and create new forms
- Responsive table layout with Bootstrap components
- Error handling and loading states

### 2. FormEditor.tsx

- Unified component for both creating and editing forms
- Uses react-hook-form for form metadata (name, description)
- Integrates FormIO FormBuilder for visual form design
- Features:
  - Unsaved changes detection and confirmation
  - Form validation
  - Delete functionality (edit mode only)
  - JSON schema editor as fallback
  - Navigation with confirmation for unsaved changes

### 3. CreateForm.tsx

- Simple wrapper component that renders FormEditor in create mode
- Provides a clean route for `/forms/create`

## Features

- **Full CRUD Operations**: Create, Read, Update, Delete forms
- **Visual Form Builder**: Uses FormIO FormBuilder for drag-and-drop form creation
- **Unsaved Changes Protection**: Warns users before navigating away with unsaved changes
- **Responsive Design**: Built with React Bootstrap for mobile-friendly layouts
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Navigation Integration**: Seamless integration with React Router

## Routes

- `/forms` - Forms list page
- `/forms/create` - Create new form page
- `/forms/edit/:id` - Edit existing form page

## Dependencies

- `react-hook-form` - Form validation and state management
- `@formio/react` - FormIO React components for form building
- `react-bootstrap` - UI components
- `react-router-dom` - Navigation

## Usage

The forms are automatically integrated into the main navigation. Users can:

1. View all forms in a table format
2. Create new forms with name, description, and visual form builder
3. Edit existing forms with full FormIO functionality
4. Delete forms with confirmation
5. Navigate safely with unsaved changes protection

## API Integration

The components use the `FormsApi` class which extends `EntityApiClient` to communicate with the backend Form endpoints.
