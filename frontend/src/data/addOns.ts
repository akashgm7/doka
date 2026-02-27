
export interface AddOnItem {
    id: string;
    name: string;
    price: number;
    image: string;
    description: string;
    category: 'Decoration' | 'Accessory' | 'Fun' | 'Gift';
}

export const addOns: AddOnItem[] = [
    {
        id: 'addon-1',
        name: 'Confetti Poppers (Pack of 3)',
        price: 150,
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80',
        description: 'Burst of joy for your celebration!',
        category: 'Fun'
    },
    {
        id: 'addon-2',
        name: 'Gold Sparkler Candles',
        price: 200,
        image: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=400&q=80',
        description: 'Add some sparkle to your cake cutting moment.',
        category: 'Accessory'
    },
    {
        id: 'addon-3',
        name: 'Number Balloons (Gold)',
        price: 100,
        image: 'https://images.unsplash.com/photo-1574390353491-92705370c72e?w=400&q=80',
        description: 'Shining gold number balloons for the milestone.',
        category: 'Decoration'
    },
    {
        id: 'addon-4',
        name: 'Balloon Arch Kit',
        price: 850,
        image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=400&q=80',
        description: 'DIY balloon arch for a grand entrance.',
        category: 'Decoration'
    },
    {
        id: 'addon-5',
        name: 'Photo Booth Props',
        price: 350,
        image: 'https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?w=400&q=80',
        description: 'Fun quirks for memorable photos.',
        category: 'Fun'
    },
    {
        id: 'addon-6',
        name: 'Fairy Lights (10m)',
        price: 250,
        image: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=400&q=80',
        description: 'Warm white LED lights to set the mood.',
        category: 'Decoration'
    },
    {
        id: 'addon-7',
        name: 'Confetti Cannons',
        price: 400,
        image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&q=80',
        description: 'Large confetti glitter blast!',
        category: 'Fun'
    },
    {
        id: 'addon-8',
        name: 'Birthday Crown',
        price: 180,
        image: 'https://images.unsplash.com/photo-1533230408708-8f9f91d12344?w=500&auto=format&fit=crop&q=60',
        description: 'Feel like royalty on your special day.',
        category: 'Accessory'
    },
    {
        id: 'addon-9',
        name: 'Disco Party Light',
        price: 650,
        image: 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=400&q=80',
        description: 'Rotating multi-color light for the dance floor.',
        category: 'Decoration'
    },
    {
        id: 'addon-10',
        name: 'Return Gift Goodie Bags',
        price: 300,
        image: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=400&q=80',
        description: 'Cute bags to share the love with guests.',
        category: 'Gift'
    }
];
