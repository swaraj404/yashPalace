// Single source of truth for all editable copy & lists.
// Update phone / email / address / socials here.

export const venue = {
  name: 'Yash Palace',
  location: 'Yeola, Maharashtra',
  tagline: 'Where Forever Begins',
  phoneDisplay: '+91 00000 00000',
  phoneHref: 'tel:+910000000000',
  email: 'hello@yashpalace.in',
  address: 'Yash Palace, Yeola, Maharashtra — 1 km from Yeola Bus Stand',
  mapEmbed: 'https://www.google.com/maps?q=Yash+Palace+Yeola+Maharashtra&output=embed',
  video: '/assets/venue-tour.mp4',
  poster: '/images/poster.jpg',
  socials: [
    { label: 'Instagram', href: '#' },
    { label: 'Facebook', href: '#' },
    { label: 'WhatsApp', href: '#contact' },
  ],
};

export const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Why Us', href: '#why' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Occasions', href: '#occasions' },
  { label: 'Contact', href: '#contact' },
];

export const marqueeItems = [
  'Weddings',
  'Receptions',
  'Engagements',
  'Sangeet',
  'Corporate Events',
  'Celebrations',
];

export const storyCaptions = [
  { eyebrow: 'Arrive in Grandeur', title: ['A welcome worthy', 'of your big day'] },
  { eyebrow: 'Sweeping Lawns', title: ['Space for every', 'guest & every dream'] },
  { eyebrow: 'The Grand Hall', title: ['Where moments', 'become memories'] },
];

export const stats = [
  { value: 3000, suffix: '+', label: 'Guest Capacity' },
  { value: 1, suffix: ' km', label: 'From Yeola Bus Stand' },
  { value: 5, suffix: '★', label: 'Rated Hospitality' },
  { value: 100, suffix: '%', label: 'Hassle-Free Events' },
];

export const features = [
  {
    icon: 'Home',
    title: 'Grand Spacious Hall',
    text: 'A magnificent hall that seats up to 3,000 guests — perfect for weddings of every scale.',
  },
  {
    icon: 'UtensilsCrossed',
    title: 'Exquisite Cuisine',
    text: 'Delicious, beautifully presented meals our guests rave about — quality you can taste.',
  },
  {
    icon: 'Flower2',
    title: 'Stunning Décor',
    text: 'Lovely, thoughtfully curated decorations that turn every event into a visual celebration.',
  },
  {
    icon: 'Crown',
    title: 'Attentive Hospitality',
    text: 'A warm, accommodating team that anticipates every need for a seamless experience.',
  },
  {
    icon: 'CarFront',
    title: 'Ample Parking',
    text: 'Generous on-site parking so your guests arrive and leave with complete ease.',
  },
  {
    icon: 'MapPin',
    title: 'Prime Location',
    text: 'Just 1 km from Yeola Bus Stand — central, accessible and easy for everyone to reach.',
  },
];

export const galleryItems = [
  { src: '/images/poster.jpg', caption: 'The Grand Approach', span: 'tall' },
  { src: '/images/frame-01.jpg', caption: 'Sweeping Lawns' },
  { src: '/images/frame-02.jpg', caption: 'Garden Pathways' },
  { src: '/images/frame-03.jpg', caption: 'The Iconic Façade', span: 'wide' },
  { src: '/images/frame-04.jpg', caption: 'Regal Archways' },
  { src: '/images/frame-05.jpg', caption: 'A Royal Welcome' },
];

export const occasions = [
  'Weddings & Receptions',
  'Engagements & Sangeet',
  'Birthdays & Anniversaries',
  'Corporate & Social Events',
];

export const testimonials = [
  {
    quote:
      'The decorations were absolutely lovely and the food was delicious and beautifully presented. A truly memorable celebration.',
    author: 'A recent guest',
  },
  {
    quote:
      'The staff were so attentive and accommodating throughout. Everything was hassle-free from start to finish.',
    author: 'A recent guest',
  },
  {
    quote:
      'A spacious, beautiful venue with great ambiance and ample parking. Perfect for our large family gathering.',
    author: 'A recent guest',
  },
];

export const eventTypes = [
  'Wedding',
  'Reception',
  'Engagement / Sangeet',
  'Birthday / Anniversary',
  'Corporate / Other',
];
