# Video Streaming Application

## 📋 Overview
ແອັບພລິເຄຊັນສະຕຣີມມິງວິດີໂອທີ່ພັດທະນາດ້ວຍ React, ໃຊ້ສໍາລັບການເບິ່ງແລະຄົ້ນຫາວິດີໂອຕ່າງໆ

## 🚀 Features

### ຄຸນສົມບັດຫຼັກ
- **ລະບົບເບິ່ງວິດີໂອ**: ຮອງຮັບການເລີ່ນວິດີໂອແບບ HLS streaming
- **ລະບົບຄົ້ນຫາ**: ຄົ້ນຫາວິດີໂອໄດ້ແບບ real-time
- **ຫມວດຫມູ່**: ຈັດກຸ່ມວິດີໂອຕາມປະເພດຕ່າງໆ (18 ຫມວດຫມູ່)
- **ໂປຣໄຟລ໌ນັກສະແດງ**: ເບິ່ງຂໍ້ມູນແລະຜົນງານຂອງນັກສະແດງ
- **Dark/Light Mode**: ສະຫຼັບໂໝດສີໄດ້ຕາມຄວາມຕ້ອງການ
- **Responsive Design**: ຮອງຮັບທຸກຂະໜາດໜ້າຈໍ
- **Infinite Scroll**: ໂຫຼດວິດີໂອເພີ່ມອັດຕະໂນມັດເມື່ອເລື່ອນລົງ

## 📁 Project Structure

```
src/
├── components/          # ຄອມໂພເນັນຫຼັກ
│   ├── Dashboard.jsx   # Layout wrapper ຫຼັກ
│   ├── Header.jsx      # ສ່ວນຫົວຂອງເວັບ
│   ├── Navbar.jsx      # ແຖບນຳທາງຫມວດຫມູ່
│   ├── SearchBox.jsx   # ກ່ອງຄົ້ນຫາ
│   └── VideoCard.jsx   # ບັດສະແດງວິດີໂອ
│
├── pages/              # ໜ້າຕ່າງໆ
│   ├── VideoPlayer.jsx # ໜ້າເລີ່ນວິດີໂອ
│   ├── VideoGrid.jsx   # ໜ້າສະແດງລາຍການວິດີໂອ
│   └── SearchResults.jsx # ໜ້າຜົນການຄົ້ນຫາ
│
├── helpers/            # ຄອມໂພເນັນຊ່ວຍ
│   ├── ProfilePage.jsx # ໜ້າໂປຣໄຟລ໌
│   ├── ProfileCard.jsx # ບັດໂປຣໄຟລ໌
│   └── ProfileCarousel.jsx # ແຖບເລື່ອນໂປຣໄຟລ໌
│
├── data/              # ການຈັດການຂໍ້ມູນ
│   └── videoData.js   # API calls ແລະ data processing
│
├── routes/            # ການຈັດການ routing
│   └── Router.jsx     # Route configuration
│
└── App.jsx           # Root component
```

## 🛠 Technologies Used

- **React 18** - UI Framework
- **React Router v6** - Navigation
- **Axios** - HTTP Client
- **HLS.js** - Video streaming
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## 📦 Installation

```bash
# Clone repository
git clone [repository-url]

# Install dependencies
npm install

# Start development server
npm run dev
```

## ⚙️ Configuration

### API Configuration
ແກ້ໄຂ `videoData.js` ເພື່ອປ່ຽນ API endpoint:
```javascript
const API_BASE_URL = '/api/';
```

### ຫມວດຫມູ່
ປັບແຕ່ງຫມວດຫມູ່ໃນ `Header.jsx` ແລະ `Router.jsx`

## 🎯 API Endpoints

- `GET /api/?ac=list` - ດຶງລາຍການວິດີໂອ
- `GET /api/?ac=detail&ids={id}` - ດຶງລາຍລະອຽດວິດີໂອ
- `GET /api/?ac=list&t={type_id}` - ດຶງວິດີໂອຕາມຫມວດຫມູ່
- `GET /api/?ac=list&wd={keyword}` - ຄົ້ນຫາວິດີໂອ

## 🔧 Key Components

### Dashboard
- ຈັດການ layout ຫຼັກ
- ຄວບຄຸມ dark/light mode
- ຈັດການ header visibility

### VideoPlayer
- ເລີ່ນວິດີໂອດ້ວຍ HLS.js
- ສະແດງວິດີໂອທີ່ກ່ຽວຂ້ອງ
- Infinite scroll ສໍາລັບວິດີໂອທີ່ກ່ຽວຂ້ອງ

### VideoGrid
- ສະແດງວິດີໂອແບບ grid layout
- Infinite scroll
- Responsive columns (3-6 columns)

### ProfilePage
- ສະແດງຂໍ້ມູນນັກສະແດງ
- Gallery ຮູບພາບ
- ລາຍການວິດີໂອຂອງນັກສະແດງ

## 🎨 Styling

ໃຊ້ Tailwind CSS ກັບ:
- Responsive breakpoints: `sm`, `md`, `lg`, `xl`
- Dark mode classes
- Custom animations

## 📱 Responsive Design

- **Mobile**: 3 columns grid, compact header
- **Tablet**: 4-5 columns grid
- **Desktop**: 5-6 columns grid
- **Large screens**: Optimized video player layout

## 🔍 Search Features

- Real-time search with debouncing (500ms)
- Search within categories
- Clear search functionality
- Search history in URL params

## 🚀 Performance Optimizations

- **Caching**: In-memory cache with 5-minute TTL
- **Lazy Loading**: Images load on demand
- **Infinite Scroll**: Load content as needed
- **Debouncing**: Prevent excessive API calls
- **Retry Logic**: Auto-retry failed requests

## 📝 Notes

- ຄອມເມັນໃນ code ເປັນພາສາລາວ
- API response format ອາດຈະແຕກຕ່າງກັນ
- ຕ້ອງມີ proxy server ສໍາລັບ API calls

## 🤝 Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is for educational purposes only.

## 🆘 Troubleshooting

### ວິດີໂອບໍ່ເລີ່ນ
- ກວດສອບ URL format
- ກວດສອບ CORS settings
- ກວດສອບ browser console

### API ບໍ່ເຮັດວຽກ
- ກວດສອບ proxy configuration
- ກວດສອບ network tab
- ກວດສອບ API endpoint

### Performance issues
- Clear browser cache
- Check network speed
- Reduce concurrent API calls