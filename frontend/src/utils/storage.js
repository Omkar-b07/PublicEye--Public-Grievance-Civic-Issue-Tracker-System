import potholeImg from '../assets/issues/pothole_issue_1776227260988.png';
import streetlightImg from '../assets/issues/broken_streetlight_1776227355315.png';
import garbageImg from '../assets/issues/overflowing_garbage_1776227280145.png';
import branchImg from '../assets/issues/fallen_branch_1776227422125.png';
import leakImg from '../assets/issues/water_leak_1776227301435.png';

const INITIAL_MOCK_ISSUES = [
    {
        id: 1,
        title: 'Pothole on Main Street',
        description: 'Deep pothole causing traffic issues and potential vehicle damage near the central park intersection.',
        category: 'Roads',
        status: 'pending',
        image: potholeImg,
        locationName: '123 Main St, Downtown',
        lat: 51.505,
        lng: -0.09,
        createdAt: '2023-10-15T08:30:00Z',
        userId: 1
    },
    {
        id: 2,
        title: 'Broken Streetlights in Suburb',
        description: 'Three consecutive streetlights are out, making the road really dark and unsafe at night.',
        category: 'Lighting',
        status: 'in progress',
        image: streetlightImg,
        locationName: 'Oakwood Avenue',
        lat: 51.51,
        lng: -0.1,
        createdAt: '2023-10-12T19:15:00Z',
        userId: 2
    },
    {
        id: 3,
        title: 'Overflowing Garbage Bin',
        description: 'Public bin at the bus stop has been overflowing for 3 days. Trash is blowing onto the street.',
        category: 'Sanitation',
        status: 'resolved',
        image: garbageImg,
        locationName: 'Station Bus Stop',
        lat: 51.515,
        lng: -0.09,
        createdAt: '2023-10-10T14:20:00Z',
        userId: 1
    },
    {
        id: 4,
        title: 'Fallen Tree Branch',
        description: 'Large branch blocking the pedestrian sidewalk after yesterday\'s storm.',
        category: 'Parks',
        status: 'pending',
        image: branchImg,
        locationName: 'North Lake Park',
        lat: 51.52,
        lng: -0.08,
        createdAt: '2023-10-16T09:45:00Z',
        userId: 3
    },
    {
        id: 5,
        title: 'Water Leak',
        description: 'Continuous flow of water coming from the pavement near the supermarket.',
        category: 'Water',
        status: 'rejected',
        image: leakImg,
        locationName: 'Market Square',
        lat: 51.50,
        lng: -0.08,
        createdAt: '2023-10-05T11:00:00Z',
        userId: 2
    }
];

const STORAGE_KEY = 'civic_issues_v3';

export const getIssues = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_ISSUES));
        return INITIAL_MOCK_ISSUES;
    }
    return JSON.parse(stored);
};

export const updateIssueStatus = (id, newStatus) => {
    const issues = getIssues();
    const updated = issues.map(i => {
        if (i.id === id) {
            return { ...i, status: newStatus };
        }
        return i;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
};

export const deleteIssue = (id) => {
    const issues = getIssues();
    const updated = issues.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
};

export const addIssue = (issue) => {
    const issues = getIssues();
    const newIssue = {
        ...issue,
        // Using timestamp as mock ID, ensuring it doesn't collide with initial 1-5 IDs
        id: Date.now()
    };
    issues.unshift(newIssue);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
    return newIssue;
};
