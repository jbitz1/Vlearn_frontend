sed -i 's/\/\*//g' src/Components/School/SchoolAdminSideNav.jsx
sed -i '/{ icon: Home, text: '\''Dashboard'\'', path: '\''\/school\/dashboard'\'' },/d' src/Components/School/SchoolAdminSideNav.jsx
sed -i '/{ icon: Layers, text: '\''Academic Structure'\'', path: '\''\/school\/academic-structure'\'' },/d' src/Components/School/SchoolAdminSideNav.jsx
sed -i '/{ icon: Users, text: '\''Teachers'\'', path: '\''\/school\/teachers'\'' },/d' src/Components/School/SchoolAdminSideNav.jsx
sed -i '/{ icon: UserCheck, text: '\''Students'\'', path: '\''\/school\/students'\'' },/d' src/Components/School/SchoolAdminSideNav.jsx
sed -i '/{ icon: CreditCard, text: '\''Subscription'\'', path: '\''\/school\/subscription'\'' },/d' src/Components/School/SchoolAdminSideNav.jsx
