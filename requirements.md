# Requirements Document

## Introduction

The **To-Do List Life Dashboard** is a client-side personal productivity web application built with HTML, CSS, and Vanilla JavaScript. It provides a single-page dashboard combining a personalized greeting with current time/date, a Pomodoro-style focus timer, a task management list, quick-access link buttons, and a light/dark mode toggle. All user data is persisted exclusively via the browser's Local Storage API — no backend server is required. The app is designed to be lightweight, visually clean, and usable as a standalone web page or browser extension.

---

## Glossary

- **Dashboard**: The single-page web application described in this document.
- **App**: Synonym for Dashboard.
- **User**: The person using the Dashboard in a browser.
- **Task**: A to-do item created by the User, containing a title and a completion state.
- **Quick Link**: A user-defined bookmark consisting of a label and a URL that opens in a new tab.
- **Focus Timer**: A countdown timer pre-set to 25 minutes, styled after the Pomodoro Technique.
- **Session**: One uninterrupted countdown cycle of the Focus Timer from start to zero.
- **Local Storage**: The browser's `localStorage` Web Storage API used for client-side persistence.
- **Theme**: The visual color scheme of the Dashboard — either `light` or `dark`.
- **Greeting**: A time-sensitive salutation displayed alongside the User's name and the current date/time.
- **Sort Order**: The sequence in which Tasks are displayed in the Task List.

---

## Requirements

### Requirement 1: Personalized Greeting with Time and Date

**User Story:** As a User, I want to see a personalized greeting with the current time and date, so that the Dashboard feels welcoming and keeps me oriented throughout the day.

#### Acceptance Criteria

1. THE Dashboard SHALL display the current local date in a human-readable format (e.g., "Wednesday, November 5, 2026").
2. WHEN a new minute begins, THE Dashboard SHALL update the displayed local time to the current time in HH:MM (24-hour) format.
3. WHEN the current local time is between 05:00 and 11:59, THE Dashboard SHALL display the greeting "Good morning".
4. WHEN the current local time is between 12:00 and 17:59, THE Dashboard SHALL display the greeting "Good afternoon".
5. WHEN the current local time is between 18:00 and 20:59, THE Dashboard SHALL display the greeting "Good evening".
6. WHEN the current local time is between 21:00 and 23:59 or between 00:00 and 04:59, THE Dashboard SHALL display the greeting "Good night".
7. IF a name has been saved by the User and the name does not exceed 50 characters, THEN THE Dashboard SHALL append the name to the greeting text separated by a comma and a space (e.g., "Good morning, Alex").
8. WHEN no name has been saved, THE Dashboard SHALL display the greeting without a name suffix (e.g., "Good morning").
9. IF the User's saved name exceeds 50 characters, THEN THE Dashboard SHALL display the greeting without a name suffix.

---

### Requirement 2: Custom Name Setting

**User Story:** As a User, I want to set and update my name, so that the greeting is personalized to me.

#### Acceptance Criteria

1. THE Dashboard SHALL provide an input field that allows the User to enter a custom name of up to 50 characters.
2. WHEN the User submits a non-empty name of 1 to 50 characters, THE Dashboard SHALL save the name to Local Storage under a defined key.
3. WHEN the User submits a non-empty name of 1 to 50 characters, THE Dashboard SHALL update the greeting to include the new name within 100 milliseconds.
4. WHEN the Dashboard loads and a name is found in Local Storage, THE Dashboard SHALL display the saved name in the greeting.
5. IF the Dashboard loads and no name is found in Local Storage, THEN THE Dashboard SHALL display a default placeholder name in the greeting.
6. IF the User submits an empty or whitespace-only name, THEN THE Dashboard SHALL retain the previously saved name without modification.

---

### Requirement 3: Focus Timer (Pomodoro-Style)

**User Story:** As a User, I want a 25-minute countdown timer with Start, Stop, and Reset controls, so that I can manage focused work sessions.

#### Acceptance Criteria

1. WHEN the page loads, THE Focus_Timer SHALL initialize the display to 25:00.
2. WHEN the User activates the Start control while the Focus_Timer is stopped, THE Focus_Timer SHALL begin counting down from 25:00 in one-second intervals.
3. WHEN the User activates the Start control while the Focus_Timer is paused, THE Focus_Timer SHALL resume counting down from the retained remaining time in one-second intervals.
4. WHILE the Focus_Timer is running, THE Focus_Timer SHALL update the displayed time every second.
5. WHEN the User activates the Stop control, THE Focus_Timer SHALL pause the countdown and retain the remaining time.
6. WHEN the User activates the Reset control, THE Focus_Timer SHALL stop any active countdown and reset the display to 25:00.
7. WHEN the countdown reaches 00:00, THE Focus_Timer SHALL stop automatically and display a visible on-screen notification indicating the session has ended.
8. WHILE the Focus_Timer is running, THE Focus_Timer SHALL disable the Start control.
9. WHILE the Focus_Timer is paused or stopped, THE Focus_Timer SHALL disable the Stop control.

---

### Requirement 4: To-Do List — Task Management

**User Story:** As a User, I want to add, edit, mark as done, sort, and delete tasks, so that I can track and manage my daily activities.

#### Acceptance Criteria

1. THE Task_List SHALL provide an input field with a maximum length of 200 characters and a submission control for adding new tasks.
2. WHEN the User submits a new task with a non-empty title, THE Task_List SHALL append the task to the list and save the updated task collection to Local Storage.
3. IF the User submits an empty or whitespace-only task title, THEN THE Task_List SHALL not add the task and SHALL display an inline validation message indicating that the task title cannot be empty.
4. WHEN the User activates the edit control for a task, THE Task_List SHALL replace the task title display with an editable input field pre-populated with the current title and a maximum length of 200 characters.
5. WHEN the User confirms an edited task title that is non-empty, THE Task_List SHALL update the task title, exit the inline edit state, and save the updated collection to Local Storage.
6. IF the User confirms an edited task title that is empty or whitespace-only, THEN THE Task_List SHALL discard the edit and restore the original title.
7. WHEN the User cancels an in-progress edit (e.g., by pressing Escape or activating a cancel control), THE Task_List SHALL discard the edit and restore the original title without saving to Local Storage.
8. WHEN the User activates the completion toggle for a task, THE Task_List SHALL toggle the task's completion state, apply strikethrough styling to the task title of completed tasks, and save the updated collection to Local Storage.
9. WHEN the User activates the delete control for a task, THE Task_List SHALL remove the task from the list and save the updated collection to Local Storage.
10. WHEN the Dashboard loads, THE Task_List SHALL read the saved task collection from Local Storage and render all saved tasks in the order in which they were originally added.
11. WHEN the User activates a sort control, THE Task_List SHALL re-order the displayed task list by the selected sort criterion, where supported criteria are: by creation date (ascending) and by completion state (incomplete tasks first).
12. IF Local Storage is unavailable or returns a parse error when reading the task collection, THEN THE Task_List SHALL render an empty task list and display an inline message indicating that saved tasks could not be loaded.

---

### Requirement 5: Task Sorting

**User Story:** As a User, I want to sort my task list, so that I can view tasks in a preferred order.

#### Acceptance Criteria

1. THE Task_List SHALL provide a sort control offering exactly the following sort orders: "Default (creation order)", "Completed last" (incomplete tasks first ordered by creation time, followed by completed tasks ordered by creation time), and "Alphabetical (A–Z)" (case-insensitive ascending order by task title).
2. WHEN the User selects a sort order, THE Task_List SHALL re-render the task list in the chosen order without altering the task records stored in Local Storage.
3. WHEN the Dashboard loads AND no sort preference exists in Local Storage, THE Task_List SHALL apply the "Default (creation order)" sort order.
4. WHEN the Dashboard loads AND a sort preference is saved in Local Storage, THE Task_List SHALL apply the saved sort order.
5. WHEN the User selects a sort order, THE Task_List SHALL save the selected sort preference to Local Storage.

---

### Requirement 6: Quick Links

**User Story:** As a User, I want to save and access favorite website links as one-click buttons, so that I can quickly navigate to frequently visited pages.

#### Acceptance Criteria

1. THE Quick_Links panel SHALL display all saved Quick Links as labeled buttons.
2. WHEN the User activates a Quick Link button, THE Dashboard SHALL open the associated URL in a new browser tab.
3. THE Quick_Links panel SHALL provide controls for adding a new Quick Link by entering a label of up to 50 characters and a URL.
4. WHEN the User submits a new Quick Link with a non-empty label and a URL beginning with `http://` or `https://`, THE Quick_Links panel SHALL add the link and save the updated link collection to Local Storage.
5. IF the User submits a new Quick Link with an empty label, an empty URL, or a URL that does not begin with `http://` or `https://`, THEN THE Quick_Links panel SHALL not add the link and SHALL display an inline validation message identifying which field or condition is invalid.
6. THE Quick_Links panel SHALL provide a delete control for each Quick Link.
7. WHEN the User activates the delete control for a Quick Link, THE Quick_Links panel SHALL remove the link and save the updated collection to Local Storage.
8. WHEN the Dashboard loads, THE Quick_Links panel SHALL read the saved link collection from Local Storage and render all saved links.

---

### Requirement 7: Light / Dark Mode Toggle

**User Story:** As a User, I want to switch between light and dark color themes, so that I can use the Dashboard comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a theme toggle control that is persistently visible in the interface and displays the currently active theme (`light` or `dark`) as its labeled or iconographic state.
2. WHEN the User activates the theme toggle, THE Dashboard SHALL switch the active theme to the opposite theme and apply the new theme styles within 100 milliseconds without a page reload.
3. WHEN the User activates the theme toggle, THE Dashboard SHALL save the selected theme to Local Storage.
4. WHEN the Dashboard loads, THE Dashboard SHALL read the saved theme from Local Storage and apply it before any styled content is painted to the screen, so that no frame with the incorrect theme is rendered.
5. IF no theme preference has been saved, THEN THE Dashboard SHALL apply the `light` theme as the default.

---

### Requirement 8: Data Persistence

**User Story:** As a User, I want all my settings and data to be available the next time I open the Dashboard, so that I do not have to re-enter information on every visit.

#### Acceptance Criteria

1. THE Dashboard SHALL use the browser Local Storage API as the sole persistence mechanism for all user data.
2. THE Dashboard SHALL persist the following data to Local Storage immediately upon each change: the User's name, the task collection, the sort preference, the Quick Link collection, and the selected theme.
3. WHEN the Dashboard loads, THE Dashboard SHALL restore all persisted data from Local Storage before presenting the interface to the User.
4. IF Local Storage contains a value for a key that cannot be parsed (e.g., malformed JSON), THEN THE Dashboard SHALL discard that value, apply the default for that key, and continue loading without blocking the interface.
5. IF Local Storage is unavailable (e.g., private browsing mode with storage blocked), THEN THE Dashboard SHALL still function for the current session using in-memory state and SHALL display a non-blocking, dismissible notice that does not obstruct any dashboard element and indicates that data will not be saved.

---

### Requirement 9: Responsive Layout and Visual Design

**User Story:** As a User, I want the Dashboard to look clean and be usable on different screen sizes, so that I can use it on both desktop and mobile browsers.

#### Acceptance Criteria

1. THE Dashboard SHALL render on viewport widths from 320 px to 2560 px without horizontal overflow, content clipping, or overlapping elements.
2. THE Dashboard SHALL use a single CSS file for all styling and a single JavaScript file for all behavior.
3. THE Dashboard SHALL maintain a visual hierarchy in both the `light` and `dark` themes where text-to-background contrast ratios meet WCAG 2.1 Level AA minimums: at least 4.5:1 for normal text and at least 3:1 for large text (18 pt or 14 pt bold).
4. WHEN the User navigates to any interactive control (button, input, toggle) via keyboard, THE Dashboard SHALL display a focus indicator with a minimum 2 px outline and a contrast ratio of at least 3:1 against the adjacent background color.
5. WHILE the viewport width is below 768 px, THE Dashboard SHALL stack all major layout sections vertically so that no section requires horizontal scrolling to read.
