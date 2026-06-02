import { Scenario } from "@/types/naturalAbility";

export const SCENARIOS: Scenario[] = [
  {
    id: 1,
    genre: "Drama",
    title: "The Road Trip Gas Money Situation",
    imageSrc: "/assets/signal-test/questions/01-road-trip-gas-money.webp",
    imageAlt:
      "Two close friends at a dusk gas station beside a road trip car, one asking for help while the other checks money and looks conflicted.",
    scenarioBody:
      "Your best friend of 10 years planned an epic summer road trip for your birthday. Halfway there, they ask you for gas money — they ran lower than they planned. Not long after, the car starts coughing in a weird way. You only have enough extra cash to either help them, or protect yourself if things go really wrong.",
    customOption: true,
    choices: [
      {
        id: "A",
        label: "I got you.",
        body: "Give them the gas money and figure out the car issue together.",
        primary: "Healer",
        secondary: "Prophet",
      },
      {
        id: "B",
        label: "Let's figure it out together.",
        body: "Split what you have, find a mechanic, plan a backup before pushing forward.",
        primary: "Manifestor",
        secondary: "Seer",
      },
      {
        id: "C",
        label: "I can't risk it.",
        body: "Hold your money, tell them the truth, suggest turning back or calling for help.",
        primary: "Reaper",
        secondary: "Prophet",
      },
    ],
  },
  {
    id: 2,
    genre: "Real Life",
    title: "The Friend Who Posts Your Business",
    imageSrc: "/assets/signal-test/questions/02-friend-posts-business.webp",
    imageAlt:
      "A young adult alone at night on a couch, hurt while reading a vague social post on their phone after trusting a close friend.",
    scenarioBody:
      "You told a close friend something personal, trusting them to keep it between you. Later, you see a vague social media post that's clearly about your exact situation. When you bring it up, they swear it wasn't about you.",
    customOption: true,
    choices: [
      {
        id: "A",
        label: "Pull up calmly.",
        body: "Tell them what you saw, how it landed, and ask for the truth without yelling.",
        primary: "Prophet",
        secondary: "Reaper",
      },
      {
        id: "B",
        label: "Step back quietly.",
        body: "Stop sharing real things with them. Watch their patterns from a distance.",
        primary: "Reaper",
        secondary: "Diviner",
      },
      {
        id: "C",
        label: "Give grace once.",
        body: "Believe them this time, but pay attention to how they handle your name going forward.",
        primary: "Empath",
        secondary: "Healer",
      },
    ],
  },
  {
    id: 3,
    genre: "Drama",
    title: "The Family Dinner Comment",
    imageSrc: "/assets/signal-test/questions/03-family-dinner-comment.webp",
    imageAlt:
      "A tense family dinner where a young adult sits under pressure while relatives react to a comment about chasing dreams.",
    scenarioBody:
      'At family dinner, a relative makes a comment about you "chasing dreams" instead of doing something stable. The table goes quiet. Everyone is watching to see what you say.',
    customOption: true,
    choices: [
      {
        id: "A",
        label: "Smile and redirect.",
        body: "Crack a smooth joke, change the subject, keep the room light.",
        primary: "Charmer",
        secondary: "Prophet",
      },
      {
        id: "B",
        label: "Speak your truth.",
        body: "Tell them exactly what you are building and why it matters to you.",
        primary: "Prophet",
        secondary: "Manifestor",
      },
      {
        id: "C",
        label: "Note it. Move on.",
        body: "Say nothing in the moment. File it away. Adjust who gets access to your plans.",
        primary: "Diviner",
        secondary: "Reaper",
      },
    ],
  },
  {
    id: 4,
    genre: "Real Life",
    title: "The Friend Who Keeps Going Back",
    imageSrc: "/assets/signal-test/questions/04-friend-keeps-going-back.webp",
    imageAlt:
      "A tired young adult taking another late-night emotional phone call from a friend repeating the same relationship pattern.",
    scenarioBody:
      "A close friend keeps crying about the same relationship — and keeps going back. You love them, but you are tired of having the same conversation. Tonight they are calling you again.",
    customOption: true,
    choices: [
      {
        id: "A",
        label: "Hold space again.",
        body: "Pick up. Let them vent. Remind them you love them no matter what they choose.",
        primary: "Empath",
        secondary: "Healer",
      },
      {
        id: "B",
        label: "Tell them the truth.",
        body: "Lovingly call out the pattern. They might not like it, but you have to say it.",
        primary: "Prophet",
        secondary: "Reaper",
      },
      {
        id: "C",
        label: "Give them a next step.",
        body: "Suggest a real action — therapy, a break, a plan — and offer to help them take it.",
        primary: "Manifestor",
        secondary: "Healer",
      },
    ],
  },
  {
    id: 5,
    genre: "Scary",
    title: "The Creepy Rideshare Moment",
    imageSrc: "/assets/signal-test/questions/05-creepy-rideshare.webp",
    imageAlt:
      "A tense late-night rideshare from the back seat, with the passenger watching the route on a low-battery phone as the driver takes a darker road.",
    scenarioBody:
      "You're leaving a late event and your phone is at 18%. Your rideshare driver takes a turn that's not on the app route. They say it's faster. The road gets darker.",
    customOption: true,
    choices: [
      {
        id: "A",
        label: "Speak up.",
        body: "Calmly ask them to follow the app route. Pin your location to someone you trust.",
        primary: "Reaper",
        secondary: "Seer",
      },
      {
        id: "B",
        label: "Fake a call.",
        body: "Pretend you are on the phone with someone, say the cross streets out loud, stay alert.",
        primary: "Manifestor",
        secondary: "Shapeshifter",
      },
      {
        id: "C",
        label: "Read the room.",
        body: "Stay quiet, watch every move, plan an exit at the next light if anything feels off.",
        primary: "Diviner",
        secondary: "Seer",
      },
    ],
  },
  {
    id: 6,
    genre: "Drama",
    title: 'The "I\'m Fine" Partner Moment',
    imageSrc: "/assets/signal-test/questions/06-im-fine-partner.webp",
    imageAlt:
      "A couple sits apart in a dim living room, one withdrawn and avoiding eye contact while the other tries to understand what changed.",
    scenarioBody:
      "Your partner has been quiet for two days. The energy in the room has changed. You ask what's wrong. They say nothing. But you can feel that something is.",
    customOption: true,
    choices: [
      {
        id: "A",
        label: "Get close.",
        body: "Sit near them, soften, let them know you are not going anywhere until they are ready.",
        primary: "Empath",
        secondary: "Healer",
      },
      {
        id: "B",
        label: "Name what you see.",
        body: "Tell them exactly what you are noticing in their tone, eyes, and energy.",
        primary: "Diviner",
        secondary: "Prophet",
      },
      {
        id: "C",
        label: "Give it a deadline.",
        body: "Let them know you are open to talking, but you will not chase silence forever.",
        primary: "Seer",
        secondary: "Reaper",
      },
    ],
  },
  {
    id: 7,
    genre: "Action",
    title: "The Last-Minute Stage Call",
    imageSrc: "/assets/signal-test/questions/07-last-minute-stage-call.webp",
    imageAlt:
      "A young performer near a stage entrance being handed a microphone with a packed crowd glowing in the background.",
    scenarioBody:
      "Someone backs out and you are pulled on stage to speak — or perform — in front of a packed room. You have about 60 seconds before the mic is in your hand. No notes. No prep.",
    customOption: true,
    choices: [
      {
        id: "A",
        label: "Run the room.",
        body: "Walk out smiling, work the crowd, ride the energy, make it feel planned.",
        primary: "Charmer",
        secondary: "Manifestor",
      },
      {
        id: "B",
        label: "Make something new.",
        body: "Improvise on the spot — a story, a freestyle, a moment — let creativity carry it.",
        primary: "Creative",
        secondary: "Shapeshifter",
      },
      {
        id: "C",
        label: "Lock in fast.",
        body: "Decide your opening line in your head, breathe, and force yourself to deliver clean.",
        primary: "Manifestor",
        secondary: "Diviner",
      },
    ],
  },
  {
    id: 8,
    genre: "Drama",
    title: "The Friend Who Copies Everything",
    imageSrc: "/assets/signal-test/questions/08-friend-copies-everything.webp",
    imageAlt:
      "Two stylish young adults in a studio mirror setup where one clearly imitates the other’s pose, color palette, and content aesthetic.",
    scenarioBody:
      'A friend keeps copying your captions, your colors, your poses, your phrases — even your goals. When you bring it up, they say "it\'s not that deep."',
    customOption: true,
    choices: [
      {
        id: "A",
        label: "Out-create them.",
        body: "Stop arguing, raise your level, make your work so original it cannot be copied cleanly.",
        primary: "Creative",
        secondary: "Alchemist",
      },
      {
        id: "B",
        label: "Cut the access.",
        body: "Mute, restrict, or remove them. Stop showing them what you are building.",
        primary: "Reaper",
        secondary: "Diviner",
      },
      {
        id: "C",
        label: "Say it plain.",
        body: "Tell them exactly what you noticed and how it has been making you feel.",
        primary: "Prophet",
        secondary: "Charmer",
      },
    ],
  },
  {
    id: 9,
    genre: "Real Life",
    title: "The Heavy Apartment Energy",
    imageSrc: "/assets/signal-test/questions/09-heavy-apartment-energy.webp",
    imageAlt:
      "A concerned visitor stands in a dim, cluttered apartment while a tired friend sits on the couch surrounded by dishes and heavy energy.",
    scenarioBody:
      "You stop by a close friend's place. It's messy, dim, the air feels stale, and they look thinner. They say they're just tired. You can feel it's more than that.",
    customOption: true,
    choices: [
      {
        id: "A",
        label: "Start with the body.",
        body: "Open a window. Make tea. Help tidy one corner. Bring them back into their body first.",
        primary: "Herbalist",
        secondary: "Healer",
      },
      {
        id: "B",
        label: "Sit close.",
        body: "Stay. Listen. Don't fix anything. Just be a soft place for them tonight.",
        primary: "Healer",
        secondary: "Empath",
      },
      {
        id: "C",
        label: "Name what you sense.",
        body: "Gently tell them what you feel in the room and ask what is really going on.",
        primary: "Diviner",
        secondary: "Empath",
      },
    ],
  },
  {
    id: 10,
    genre: "Action",
    title: "The Post That Went Viral",
    imageSrc: "/assets/signal-test/questions/10-post-that-went-viral.webp",
    imageAlt:
      "A young adult in bed at night overwhelmed by glowing social notifications after a personal post goes viral.",
    scenarioBody:
      "You posted something personal and it blew up overnight. Strangers are reposting it. People you do not know are in your comments. You feel excited and exposed at the same time.",
    customOption: true,
    choices: [
      {
        id: "A",
        label: "Ride the wave.",
        body: "Post a follow-up while the moment is hot, turn this into momentum for your bigger vision.",
        primary: "Manifestor",
        secondary: "Creative",
      },
      {
        id: "B",
        label: "Build from it.",
        body: "Start sketching the next thing — a series, a project, a brand piece — while the heat is real.",
        primary: "Creative",
        secondary: "Charmer",
      },
      {
        id: "C",
        label: "Pull back.",
        body: "Archive the post or close comments. Protect your peace before momentum costs you yourself.",
        primary: "Reaper",
        secondary: "Ungifted",
      },
    ],
  },
  {
    id: 11,
    genre: "Drama",
    title: "The Dream That Felt Too Real",
    scenarioBody:
      "You wake up shaking from a dream where an old friend you haven't spoken to in months was crying. You can't shake the feeling. Your phone is right there.",
    imageSrc: "/assets/signal-test/questions/11-dream-felt-too-real.webp",
    imageAlt:
      "A young adult sits awake in a dim bedroom holding a phone after a dream about an old friend felt too real to ignore.",
    customOption: true,
    choices: [
      {
        id: "A",
        label: "Reach out.",
        body: "Text them. Tell them you had a dream and just wanted to check on them.",
        primary: "Diviner",
        secondary: "Empath",
      },
      {
        id: "B",
        label: "Sit with it.",
        body: "Journal what you saw. Look for what your gut is trying to tell you about the future.",
        primary: "Seer",
        secondary: "Dreamer",
      },
      {
        id: "C",
        label: "Make something.",
        body: "Turn the dream into a song, a note, a scene — let the message become art.",
        primary: "Creative",
        secondary: "Dreamer",
      },
    ],
  },
  {
    id: 12,
    genre: "Funny",
    title: "The Joke At Your Expense",
    scenarioBody:
      "You're with a group and someone jokes about an insecurity you've only mentioned to them privately. Everyone laughs awkwardly. They look at you to laugh too.",
    imageSrc: "/assets/signal-test/questions/12-joke-at-your-expense.webp",
    imageAlt:
      "A small group laughs awkwardly in a living room while a young adult absorbs a joke that touched a private insecurity.",
    customOption: true,
    choices: [
      {
        id: "A",
        label: "Flip it smooth.",
        body: "Crack a joke back that wins the room and quietly puts them in their place.",
        primary: "Charmer",
        secondary: "Reaper",
      },
      {
        id: "B",
        label: "Call it.",
        body: 'Say "that was a private thing" out loud. Let the silence sit.',
        primary: "Prophet",
        secondary: "Reaper",
      },
      {
        id: "C",
        label: "Clock everything.",
        body: "Smile, say nothing, remember every face that laughed and what it told you.",
        primary: "Diviner",
        secondary: "Empath",
      },
    ],
  },
  {
    id: 13,
    genre: "Real Life",
    title: "The Burnout Morning",
    scenarioBody:
      "You wake up tired in a tired room. Phone full of notifications. Body begging for rest. Brain already running a to-do list before your feet hit the floor.",
    imageSrc: "/assets/signal-test/questions/13-burnout-morning.webp",
    imageAlt:
      "A tired young adult sits on the edge of a messy bed in a cluttered room, overwhelmed before the day even begins.",
    customOption: true,
    choices: [
      {
        id: "A",
        label: "Reset the body.",
        body: "Phone down. Water. Open a window. Slow morning before any task touches you.",
        primary: "Herbalist",
        secondary: "Healer",
      },
      {
        id: "B",
        label: "Push through.",
        body: "Pick the one task that matters most and force a win to break the heaviness.",
        primary: "Manifestor",
        secondary: "Alchemist",
      },
      {
        id: "C",
        label: "Feel it out.",
        body: "Ask yourself what is really tired — body, heart, or signal — and respond to that.",
        primary: "Empath",
        secondary: "Diviner",
      },
    ],
  },
  {
    id: 14,
    genre: "Drama",
    title: "The Conversation You Overheard",
    scenarioBody:
      "You walk in and accidentally hear people talking about a friend of yours — leaving out context that would change the whole story. They do not see you yet.",
    imageSrc: "/assets/signal-test/questions/14-conversation-overheard.webp",
    imageAlt:
      "A young adult listens from a doorway while people in the next room talk unfairly about a friend without noticing him.",
    customOption: true,
    choices: [
      {
        id: "A",
        label: "Step in.",
        body: "Walk over, fill in what they missed, defend your friend in real time.",
        primary: "Prophet",
        secondary: "Healer",
      },
      {
        id: "B",
        label: "Listen longer.",
        body: "Stay quiet, gather information, understand who is really driving this.",
        primary: "Diviner",
        secondary: "Seer",
      },
      {
        id: "C",
        label: "Warn your friend.",
        body: "Leave without confronting, then tell your friend exactly what was said and by who.",
        primary: "Empath",
        secondary: "Reaper",
      },
    ],
  },
  {
    id: 15,
    genre: "Funny",
    title: 'The "Everybody Is Going" Invite',
    scenarioBody:
      "You get a last-minute invite to a function. Halfway through getting ready you find out someone you fell out with will be there. Everybody is already on the way.",
    imageSrc: "/assets/signal-test/questions/15-everybody-is-going-invite.webp",
    imageAlt:
      "A stylish young adult checks himself in the mirror with clothes laid out, deciding whether to go somewhere after learning an old conflict will be there.",
    customOption: true,
    choices: [
      {
        id: "A",
        label: "Walk in fly.",
        body: "Go anyway. Look good. Work the room. Use it as practice in poise.",
        primary: "Charmer",
        secondary: "Alchemist",
      },
      {
        id: "B",
        label: "Skip it.",
        body: "Stay home, light something, protect your peace, watch a movie instead.",
        primary: "Reaper",
        secondary: "Herbalist",
      },
      {
        id: "C",
        label: "Read the room first.",
        body: "Pull up late, scan who is there, decide on the spot whether to stay or bounce.",
        primary: "Shapeshifter",
        secondary: "Seer",
      },
    ],
  },
  {
    id: 16,
    genre: "Drama",
    title: "The Big Idea With No Support",
    scenarioBody:
      "You finally share a big idea with someone close to you. Before you finish, they list every reason it won't work. They say they're just being realistic.",
    imageSrc: "/assets/signal-test/questions/16-big-idea-no-support.webp",
    imageAlt:
      "A young adult explains a big idea at a table with a laptop and sketches while someone close listens skeptically.",
    customOption: true,
    choices: [
      {
        id: "A",
        label: "Stop sharing.",
        body: "Pull the idea back. Stop pitching to people who only see ceilings.",
        primary: "Reaper",
        secondary: "Dreamer",
      },
      {
        id: "B",
        label: "Build anyway.",
        body: "Smile, change the subject, then go home and start building it in private.",
        primary: "Manifestor",
        secondary: "Alchemist",
      },
      {
        id: "C",
        label: "Make it visible.",
        body: "Sketch, draft, design, demo — turn the idea into something they can actually see.",
        primary: "Creative",
        secondary: "Seer",
      },
    ],
  },
  {
    id: 17,
    genre: "Real Life",
    title: "The Friend Who Needs You On Your Worst Day",
    scenarioBody:
      "You are already having a hard week. Sleep is bad. You barely ate. Then a friend calls crying and says they need you tonight.",
    imageSrc: "/assets/signal-test/questions/17-friend-needs-you-worst-day.webp",
    imageAlt:
      "An exhausted young adult sits in a dim room on a phone call, conflicted between helping a friend and having nothing left to give.",
    customOption: true,
    choices: [
      {
        id: "A",
        label: "Show up anyway.",
        body: "Pick up. Be there. You can rest after. They need you right now.",
        primary: "Empath",
        secondary: "Healer",
      },
      {
        id: "B",
        label: "Tell the truth.",
        body: "Say honestly that you are running low and offer what you can — and what you cannot.",
        primary: "Prophet",
        secondary: "Herbalist",
      },
      {
        id: "C",
        label: "Set a window.",
        body: "Give them 20 minutes of real presence, then protect your sleep and circle back tomorrow.",
        primary: "Healer",
        secondary: "Reaper",
      },
    ],
  },
  {
    id: 18,
    genre: "Action",
    title: "The Room Full Of Strangers",
    scenarioBody:
      "You walk into a room where everyone is already grouped up. One person across the room looks at you like they are deciding whether you belong here.",
    imageSrc: "/assets/signal-test/questions/18-room-full-of-strangers.webp",
    imageAlt:
      "A young adult stands at the entrance of a crowded social gathering, reading the room while strangers look back at him.",
    customOption: true,
    choices: [
      {
        id: "A",
        label: "Match the room.",
        body: "Read the energy fast, adjust your tone, blend in until you find your real people.",
        primary: "Shapeshifter",
        secondary: "Charmer",
      },
      {
        id: "B",
        label: "Own the doorway.",
        body: "Smile, make eye contact, walk in like you were invited by the host themselves.",
        primary: "Charmer",
        secondary: "Manifestor",
      },
      {
        id: "C",
        label: "Watch first.",
        body: "Grab a drink, post up against a wall, study who is real and who is performing.",
        primary: "Diviner",
        secondary: "Seer",
      },
    ],
  },
  {
    id: 19,
    genre: "Real Life",
    title: "The Five-Minute Voice Memo",
    scenarioBody:
      "Your phone buzzes with a 5-minute voice memo from a friend mid-breakdown. You care about them. You're also tired of being everyone's emotional emergency room.",
    imageSrc: "/assets/signal-test/questions/19-five-minute-voice-memo.webp",
    imageAlt:
      "A tired young adult sits alone at night holding a phone after receiving a long emotional voice memo from a friend.",
    customOption: true,
    choices: [
      {
        id: "A",
        label: "Listen fully.",
        body: "Stop what you are doing. Hear the whole thing. Reply with real care.",
        primary: "Empath",
        secondary: "Healer",
      },
      {
        id: "B",
        label: "Reply with a boundary.",
        body: "Tell them you love them, you cannot hold all of this tonight, and offer one small thing instead.",
        primary: "Herbalist",
        secondary: "Prophet",
      },
      {
        id: "C",
        label: "Read between.",
        body: "Listen on 1.5x, find the real ask under the words, respond to that — not the noise.",
        primary: "Diviner",
        secondary: "Healer",
      },
    ],
  },
  {
    id: 20,
    genre: "Action",
    title: "The Final Door",
    scenarioBody:
      "An opportunity lands in your inbox that could change your life. The catch: taking it means leaving behind a version of you that everyone around you is used to. People will have feelings.",
    imageSrc: "/assets/signal-test/questions/20-final-door.webp",
    imageAlt:
      "A young adult stands near an open doorway with a packed bag and phone, facing a life-changing opportunity and the old life he must leave behind.",
    customOption: true,
    choices: [
      {
        id: "A",
        label: "Walk through it.",
        body: "Say yes. Adjust your life around the opportunity. Reinvent on the move.",
        primary: "Manifestor",
        secondary: "Shapeshifter",
      },
      {
        id: "B",
        label: "Close the old door.",
        body: "End the version of you that cannot come on this trip. Grieve. Then go.",
        primary: "Reaper",
        secondary: "Alchemist",
      },
      {
        id: "C",
        label: "Build the bridge.",
        body: "Take it, but design the path so what you love about your old life still has a seat.",
        primary: "Creative",
        secondary: "Alchemist",
      },
    ],
  },
];
