# **App Name**: SchoolSync Board

## Core Features:

- School Selection with Password: Display school blocks, each clickable after entering the school-specific password.
- Bell Schedule & Timer: Display a schedule of bell ringing times synced via NTP and a real-time countdown timer with a bell icon for lesson start/end. Must show a warning and turn parts of the UI orange if sync fails for more than a few seconds. Timer should continue counting even during data updates.
- Information Board with Event Calendar: Rotating display of information (text/photos) including events pulled in real-time from a Firestore collection, including title, description, image URL, start/end dates, and active status, automatically filtering active events for the current date.
- Admin Panel: A password-protected (private PIN) admin panel for adding/editing lessons, announcements, logos, and adjusting bell sounds and board colors.
- Emergency Announcement Mode: An admin-controlled mode to temporarily overlay an important announcement, for example, evacuation notice.
- Mobile Version via QR Code: A mobile-friendly page (/mobile) accessible via QR code displaying today's schedule and active announcements. Generate the QR code with window.location.origin to support different environments.
- Real-time Updates with Animation: Implement Firestore real-time listeners (onSnapshot) to update components without page reloads, with a smooth fade animation (300-500ms). An AI powered feature, that acts as a tool deciding, using past admin edits, what kind of fade in animation to use, to reinforce user retention
- Admin Log History: Tracks and logs the activities performed in the admin panel. A separate Firestore collection stores logs of who changed which content, and when.
- Announcement Versioning: A backup and versioning system using a Firestore collection announcementVersions to automatically save the old versions of the announcements before the edits made by the admin. Enable the admin to preview old versions before restore.
- Offline Fallback: Last saved data is cached in local storage to provide content to the user in the event of Internet Disconnect.

## Style Guidelines:

- Primary color: Dark blue (#30475E) to convey trust, stability, and importance in the educational context.
- Background color: Very light gray (#F0F4F8), offering a subtle contrast to the dark primary color for readability and clean interface. Its brightness is adapted to the dark scheme chosen for this app.
- Accent color: Purple (#6A4C93) provides a distinct contrast and complements the dark blue, suitable for highlighting interactive elements such as active links or buttons.
- Body and headline font: 'PT Sans', a humanist sans-serif that offers a balance of modernity and approachability for an educational context. Use it for headlines and body.
- Use clear, professional icons, with an outline style, for elements like the bell timer, admin panel, and mobile QR code.
- School selection blocks should be visually prominent. Maintain consistency in the layout, balancing content display and the bell schedule/timer. QR code in bottom corner of screen. Optimize for Georgian script.
- Subtle animations such as fading for content updates and transitions, emphasizing a smooth and seamless user experience.