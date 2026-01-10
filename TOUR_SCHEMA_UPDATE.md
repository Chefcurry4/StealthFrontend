# Interactive Tour System - Database Schema Update

## Required Database Migration

The new interactive tour system requires a new column in the `Users(US)` table to persist tour progress.

### SQL Migration

Run the following SQL in your Supabase SQL editor:

```sql
-- Add tour_progress column to Users table
ALTER TABLE "Users(US)" 
ADD COLUMN IF NOT EXISTS tour_progress INTEGER DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN "Users(US)".tour_progress IS 'Current step index in the interactive tour (0-12), NULL if not started or completed';
```

### Column Details

- **Name**: `tour_progress`
- **Type**: `INTEGER`
- **Nullable**: Yes (NULL indicates tour not started or completed)
- **Default**: `NULL`
- **Range**: 0-12 (13 total steps in the tour)

### Notes

- The `guide_completed` boolean column already exists and is used to track if the user has finished the tour
- When a user completes the tour, `guide_completed` is set to `true` and `tour_progress` is set to `NULL`
- Tour progress is automatically saved after each step navigation
- Users can resume the tour from where they left off if they navigate away mid-tour

## Tour Features

The interactive tour includes:

1. **Welcome Step** - Cinematic intro (auto-advances after 5 seconds)
2. **Workbench Navigation** - Routes to /workbench
3. **Chat Interface Spotlight** - Highlights the AI chat input
4. **Live Chat Demo** - Simulates typing a query
5. **Model Selector** - Shows available AI models
6. **Sidebar Introduction** - Opens and highlights saved items
7. **Drag-and-Drop Demo** - Demonstrates dragging items to chat
8. **@ Mention Feature** - Shows the mention popup
9. **Email Composer** - Highlights email composition feature
10. **Courses Overview** - Brief tour of course filters
11. **Labs Overview** - Brief tour of lab filters
12. **Profile Overview** - Shows customization options
13. **Completion Step** - Celebration with confetti and next steps

## Keyboard Controls

- **Arrow Right**: Next step
- **Arrow Left**: Previous step
- **Escape**: Skip tour
- **Space**: Pause/Resume

## Tour Exclusions

As per requirements, the following pages are **NOT** included in the tour:
- Universities page
- Diary page
