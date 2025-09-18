/**
 * Level Definitions
 * ----------------------------------------
 * Defines the progression system for users based
 * on total message counts. Each level has:
 * - `level`: a professional, motivational name
 * - `messages`: the message threshold to unlock it
 * - `message`: a positive notification shown on level-up
 *
 * Notes:
 * - Starts with a default level at 0 messages.
 * - Designed for clarity and recruiter-ready presentation.
 */

const levels = [
  { level: "Newcomer", messages: 0, message: "Welcome! Your journey begins here. Keep engaging to unlock your next milestone." },
  { level: "Active Participant", messages: 10, message: "Nice start! You're beginning to contribute to the conversation." },
  { level: "Contributor", messages: 25, message: "Great work! You're showing consistent engagement." },
  { level: "Engaged Member", messages: 50, message: "You've hit 50 messages! Your presence is starting to stand out." },
  { level: "Dedicated Member", messages: 100, message: "100 messages! You're a reliable part of the community." },
  { level: "Community Advocate", messages: 200, message: "200 messages! You're building real momentum in the conversation." },
  { level: "Collaborator", messages: 350, message: "350 messages! You're actively helping shape discussions." },
  { level: "Team Player", messages: 500, message: "500 messages! You're a recognized contributor in this space." },
  { level: "Leader-in-Training", messages: 750, message: "750 messages! You're stepping into a leadership role." },
  { level: "Community Leader", messages: 1000, message: "1,000 messages! Your impact is widely recognized." },
  { level: "Mentor", messages: 1500, message: "1,500 messages! You're setting an example for others." },
  { level: "Trusted Voice", messages: 2000, message: "2,000 messages! Your contributions carry weight." },
  { level: "Influencer", messages: 3000, message: "3,000 messages! Your activity drives conversations forward." },
  { level: "Visionary", messages: 5000, message: "5,000 messages! You're shaping the culture of this community." },
  { level: "Pioneer", messages: 10000, message: "10,000 messages! You've reached the peak of engagement. Outstanding commitment!" },
];

module.exports = levels;
