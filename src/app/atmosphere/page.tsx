import Atmosphere from ".";

// Mobile layout variant (desktop is the same for all):
//   "one"   — video cover + white sheet with a masonry photo grid
//   "two"   — full-screen vertical slides, one room per swipe
//   "three" — auto "look around" tour: drifting scenes, story bars, tap to step
//   "four"  — cinematic premium: curtain hero, word-by-word text, parallax photos
const Page = () => <Atmosphere variant="four" />;

export default Page;
