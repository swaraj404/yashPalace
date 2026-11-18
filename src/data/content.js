// Single source of truth for all editable copy & lists.
// Update phone / email / address / socials here.

const phoneDigits = '919271712442';

export const venue = {
  name: 'Yash Palace',
  location: 'Yeola, Maharashtra',
  tagline: 'Where Forever Begins',
  phoneDisplay: '+91 92717 12442',
  phoneHref: `tel:+${phoneDigits}`,
  whatsappHref: `https://wa.me/${phoneDigits}?text=${encodeURIComponent(
    'Hello Yash Palace, I would like to ask about booking a date.'
  )}`,
  email: '', // Add the real address here and it appears on the site automatically.
  address: 'Yash Palace, Yeola, Maharashtra. 1 km from Yeola Bus Stand',
  mapEmbed: 'https://www.google.com/maps?q=Yash+Palace+Yeola+Maharashtra&output=embed',
  directionsHref: 'https://www.google.com/maps/search/?api=1&query=Yash+Palace+Yeola+Maharashtra',
  video: '/assets/venue-tour.mp4',
  poster: '/images/poster.jpg',
};

export const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Why us', href: '#why' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Occasions', href: '#occasions' },
  { label: 'Available dates', href: '#availability' },
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

// `span` sets each photo's place in the gallery mosaic.
export const galleryItems = [
  {
    src: '/images/venue/stage-wide.jpg',
    caption: 'The floral stage',
    alt: 'Wedding stage with rose-covered golden arches, white sofas and a bank of flowers',
    span: 'col-span-2 row-span-2 lg:col-span-8 lg:row-span-3',
  },
  {
    src: '/images/venue/arches-portrait.jpg',
    caption: 'Arches in bloom',
    alt: 'Lit golden arches framed with pink and white roses',
    span: 'row-span-2 lg:col-span-4 lg:row-span-3',
  },
  {
    src: '/images/venue/hall-facade.jpg',
    caption: 'Under the canopy',
    alt: 'Decorated canopy with chandeliers leading to the arched palace front',
    span: 'row-span-1 lg:col-span-4 lg:row-span-2',
  },
  {
    src: '/images/venue/floral-column.jpg',
    caption: 'Fresh rose columns',
    alt: 'Close view of pink and white rose columns on the stage',
    span: 'row-span-1 lg:col-span-3 lg:row-span-2',
  },
  {
    src: '/images/venue/stage-florals.jpg',
    caption: 'Flowers along the stage',
    alt: 'Red, yellow and purple flowers above tropical green plants',
    span: 'col-span-2 row-span-1 lg:col-span-5 lg:row-span-2',
  },
  {
    src: '/images/venue/hall-wide.jpg',
    caption: 'Seating for your guests',
    alt: 'Rows of white covered chairs and sofas along a patterned carpet',
    span: 'col-span-2 row-span-2 lg:col-span-7 lg:row-span-3',
  },
  {
    src: '/images/venue/stage-sofas-portrait.jpg',
    caption: 'Seats of honour',
    alt: 'White carved stage sofas beside a floral urn and rose columns',
    span: 'row-span-2 lg:col-span-5 lg:row-span-3',
  },
  {
    src: '/images/venue/stage-aisle.jpg',
    caption: 'The stage approach',
    alt: 'View along the flower-lined stage from the guest aisle',
    span: 'row-span-2 lg:col-span-5 lg:row-span-2',
  },
  {
    src: '/images/frame-03.jpg',
    caption: 'The palace front',
    alt: 'Yash Palace front with its grand columns',
    span: 'col-span-2 row-span-1 lg:col-span-7 lg:row-span-2',
  },
];

export const occasions = [
  {
    title: 'Weddings & receptions',
    text: 'A full stage, room for every guest and a day that runs to your rituals.',
    image: '/images/venue/stage-arches.jpg',
    alt: 'Golden floral arches on the wedding stage',
  },
  {
    title: 'Engagements & sangeet',
    text: 'A warm setting for the family, the music and the first big moments.',
    image: '/images/venue/stage-seating.jpg',
    alt: 'Stage sofas in front of rose columns',
  },
  {
    title: 'Birthdays & anniversaries',
    text: 'Colour, flowers and plenty of space to celebrate the people you love.',
    image: '/images/venue/stage-florals.jpg',
    alt: 'Bright flowers arranged along the stage',
  },
  {
    title: 'Corporate & social events',
    text: 'Large-format seating that is easy for your guests to reach.',
    image: '/images/venue/hall-wide.jpg',
    alt: 'Long rows of guest seating in the hall',
  },
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
