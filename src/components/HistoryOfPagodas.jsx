// components/HistoryOfPagodas.jsx
import React, { useState, useEffect } from 'react';
import Header from './Header';

function HistoryOfPagodas() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPagodaId, setSelectedPagodaId] = useState(null);
  const [selectedPagodaForEdit, setSelectedPagodaForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAllDropdown, setShowAllDropdown] = useState(false);
  const [images, setImages] = useState([]);

  const [formData, setFormData] = useState({
    pagodaName: '',
    location: '',
    price: '',
    discount: '',
    startDate: '',
    endDate: '',
    description: '',
    history: '',
    tags: '',
    facilities: '',
    images: []
  });

  // Bagan Pagodas Data with Myanmar language
  const [pagodas, setPagodas] = useState([
    {
      id: 1,
      name: 'အာနန္ဒာဘုရား',
      nameEn: 'Ananda Temple',
      location: 'Old Bagan, Mandalay Region',
      locationMm: 'ပုဂံရှေးဟောင်းမြို့၊ မန္တလေးတိုင်း',
      price: 'Free',
      rating: 4.9,
      reviews: '5.2K',
      images: ['🛕', '🛕', '🛕'],
      descriptionMm: 'ပုဂံ၏ အလှပဆုံးနှင့် ဒီဇိုင်းအကောင်းဆုံးဘုရားတစ်ဆူဖြစ်သည်။',
      description: 'One of the most beautiful and best-preserved temples in Bagan.',
      historyMm: 'အာနန္ဒာဘုရားကို ပုဂံခေတ် ဘုရင် ကျန်စစ်သားမင်းကြီးက ခရစ်နှစ် ၁၁၀၅ ခုနှစ်တွင် တည်ထားခဲ့သည်။ ဤဘုရားသည် မွန်ဗိသုကာလက်ရာများဖြင့် တည်ဆောက်ထားပြီး အနုပညာလက်ရာများအပြည့်အဝရှိသည်။',
      history: 'Built by King Kyanzittha in 1105 AD. The temple features Mon architecture and is filled with intricate artwork.',
      tags: 'အာနန္ဒာ, ပုဂံ, စေတီ, Ananda, Bagan',
      bestTimeToVisit: 'November to February',
      bestTimeToVisitMm: 'နိုဝင်ဘာလမှ ဖေဖော်ဝါရီလ'
    },
    {
      id: 2,
      name: 'ဓမ္မရံကြီးဘုရား',
      nameEn: 'Dhammayan Gyi Temple',
      location: 'Old Bagan, Mandalay Region',
      locationMm: 'ပုဂံရှေးဟောင်းမြို့၊ မန္တလေးတိုင်း',
      price: 'Free',
      rating: 4.8,
      reviews: '4.8K',
      images: ['🛕', '🛕', '🛕'],
      descriptionMm: 'ပုဂံ၏ အကြီးဆုံးဘုရားတစ်ဆူဖြစ်ပြီး အထင်ကြီးလောက်သောအုတ်ခုံဗိသုကာလက်ရာများဖြင့် တည်ဆောက်ထားသည်။',
      description: 'The largest temple in Bagan, known for its massive brick construction.',
      historyMm: 'ဓမ္မရံကြီးဘုရားကို ပုဂံခေတ် ဘုရင် နရသူမင်းကြီးက ခရစ်နှစ် ၁၁၆၇-၁၁၇၀ ခုနှစ်တွင် တည်ထားခဲ့သည်။ ဤဘုရားသည် ၎င်း၏ကြီးမားသောအရွယ်အစားနှင့် အတွင်းပိုင်းရှိ လှပသောနံရံဆေးရေးပန်းချီများကြောင့် ကျော်ကြားသည်။',
      history: 'Built by King Narathu between 1167-1170 AD. Famous for its massive size and beautiful interior wall paintings.',
      tags: 'ဓမ္မရံကြီး, ပုဂံ, စေတီ, Dhammayan Gyi, Bagan',
      bestTimeToVisit: 'November to February',
      bestTimeToVisitMm: 'နိုဝင်ဘာလမှ ဖေဖော်ဝါရီလ'
    },
    {
      id: 3,
      name: 'ရွှေစည်းခုံဘုရား',
      nameEn: 'Shwesandaw Pagoda',
      location: 'Old Bagan, Mandalay Region',
      locationMm: 'ပုဂံရှေးဟောင်းမြို့၊ မန္တလေးတိုင်း',
      price: 'Free',
      rating: 4.9,
      reviews: '6.1K',
      images: ['🛕', '🛕', '🛕'],
      descriptionMm: 'နေဝင်ချိန်နေရောင်ပြာသာဒ်ကို ကြည့်ရှုရန် အကောင်းဆုံးနေရာဖြစ်သော ပုဂံ၏အထင်ကရစေတီတစ်ဆူ။',
      description: 'The most popular sunset viewing spot in Bagan with panoramic views.',
      historyMm: 'ရွှေစည်းခုံဘုရားကို ပုဂံခေတ် ဘုရင် အနော်ရထာမင်းကြီးက ခရစ်နှစ် ၁၀၅၇ ခုနှစ်တွင် စတင်တည်ထားခဲ့ပြီး ဘုရင် အလောင်းစည်သူမင်းကြီးက အပြီးသတ်တည်ဆောက်ခဲ့သည်။',
      history: 'Started by King Anawrahta in 1057 AD and completed by King Alaungsithu. It is one of the most important pilgrimage sites in Bagan.',
      tags: 'ရွှေစည်းခုံ, ပုဂံ, စေတီ, Shwesandaw, Bagan',
      bestTimeToVisit: 'November to February',
      bestTimeToVisitMm: 'နိုဝင်ဘာလမှ ဖေဖော်ဝါရီလ'
    },
    {
      id: 4,
      name: 'သဗ္ဗညုဘုရား',
      nameEn: 'Sarabha Gate',
      location: 'Old Bagan, Mandalay Region',
      locationMm: 'ပုဂံရှေးဟောင်းမြို့၊ မန္တလေးတိုင်း',
      price: 'Free',
      rating: 4.7,
      reviews: '3.2K',
      images: ['🛕', '🛕', '🛕'],
      descriptionMm: 'ပုဂံ၏ တစ်ခုတည်းသော မူလမြို့ရိုးတံခါးပေါက်ဖြစ်သည်။',
      description: 'The only surviving original city gate of ancient Bagan.',
      historyMm: 'သဗ္ဗညုတံခါးသည် ပုဂံခေတ်မှ တစ်ခုတည်းသော ကျန်ရှိနေသေးသည့် မူလမြို့ရိုးတံခါးပေါက်ဖြစ်သည်။ ၎င်းသည် ခရစ်နှစ် ၉ရာစုနှောင်းပိုင်းတွင် တည်ဆောက်ခဲ့သည်ဟု ယုံကြည်ရသည်။',
      history: 'The Sarabha Gate is the only remaining original city gate from ancient Bagan. It is believed to have been built in the late 9th century AD.',
      tags: 'သဗ္ဗညု, ပုဂံ, တံခါး, Sarabha, Bagan',
      bestTimeToVisit: 'November to February',
      bestTimeToVisitMm: 'နိုဝင်ဘာလမှ ဖေဖော်ဝါရီလ'
    },
    {
      id: 5,
      name: 'သူပိဋကကျောင်းတိုက်',
      nameEn: 'Thatbyinnyu Temple',
      location: 'Old Bagan, Mandalay Region',
      locationMm: 'ပုဂံရှေးဟောင်းမြို့၊ မန္တလေးတိုင်း',
      price: 'Free',
      rating: 4.8,
      reviews: '4.5K',
      images: ['🛕', '🛕', '🛕'],
      descriptionMm: 'ပုဂံ၏ အမြင့်ဆုံးဘုရားဖြစ်ပြီး မြင်ကွင်းကျယ်ရှုခင်းများကို ခံစားနိုင်သည်။',
      description: 'The tallest temple in Bagan, offering spectacular views of the ancient city.',
      historyMm: 'သူပိဋကဘုရားကို ဘုရင် အလောင်းစည်သူမင်းကြီးက ခရစ်နှစ် ၁၁၄၄ ခုနှစ်တွင် တည်ထားခဲ့သည်။ ၎င်းသည် အမြင့်ပေ ၂၀၀ ကျော်ရှိပြီး ပုဂံ၏ အထင်ကရဘုရားတစ်ဆူဖြစ်သည်။',
      history: 'Built by King Alaungsithu in 1144 AD. Standing over 200 feet tall, it is one of the most iconic temples in Bagan.',
      tags: 'သူပိဋက, ပုဂံ, စေတီ, Thatbyinnyu, Bagan',
      bestTimeToVisit: 'November to February',
      bestTimeToVisitMm: 'နိုဝင်ဘာလမှ ဖေဖော်ဝါရီလ'
    },
    {
      id: 6,
      name: 'မြစေတီဘုရား',
      nameEn: 'Myazedi Pagoda',
      location: 'Old Bagan, Mandalay Region',
      locationMm: 'ပုဂံရှေးဟောင်းမြို့၊ မန္တလေးတိုင်း',
      price: 'Free',
      rating: 4.6,
      reviews: '2.8K',
      images: ['🛕', '🛕', '🛕'],
      descriptionMm: 'မြန်မာစာ၏ အစောဆုံးကျောက်စာအတွက် ကျော်ကြားသောဘုရား။',
      description: 'Famous for its ancient stone inscription, the earliest known Myanmar language inscription.',
      historyMm: 'မြစေတီဘုရားသည် ၎င်း၏ ကျောက်စာအတွက် ကျော်ကြားပြီး မြန်မာအုပ်စုစာပေ၏ အစောဆုံးသက်သေတစ်ခုဖြစ်သည်။ ခရစ်နှစ် ၁၁၁၃ ခုနှစ်တွင် ရေးထိုးခဲ့သည်။',
      history: 'Myazedi is famous for its stone inscription, which is one of the earliest examples of Myanmar literature. It was inscribed in 1113 AD.',
      tags: 'မြစေတီ, ပုဂံ, ကျောက်စာ, Myazedi, Bagan',
      bestTimeToVisit: 'November to February',
      bestTimeToVisitMm: 'နိုဝင်ဘာလမှ ဖေဖော်ဝါရီလ'
    }
  ]);

  const handleThemeChange = (isDark) => {
    setIsDarkMode(isDark);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages([...images, reader.result]);
        setFormData({ ...formData, images: [...formData.images, reader.result] });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setFormData({ ...formData, images: newImages });
  };

  const handleAddPagoda = () => {
    if (formData.pagodaName && formData.location) {
      const newPagoda = {
        id: pagodas.length + 1,
        name: formData.pagodaName,
        nameEn: formData.pagodaName,
        location: formData.location,
        locationMm: formData.location,
        price: formData.price || 'Free',
        rating: 4.5,
        reviews: '0',
        images: formData.images.length > 0 ? formData.images : ['🛕'],
        descriptionMm: formData.description,
        description: formData.description,
        historyMm: formData.history,
        history: formData.history,
        tags: formData.tags,
        bestTimeToVisit: formData.startDate,
        bestTimeToVisitMm: formData.startDate
      };
      setPagodas([newPagoda, ...pagodas]);
      setFormData({
        pagodaName: '',
        location: '',
        price: '',
        discount: '',
        startDate: '',
        endDate: '',
        description: '',
        history: '',
        tags: '',
        facilities: '',
        images: []
      });
      setImages([]);
      alert('Pagoda information added successfully!');
    } else {
      alert('Please fill in pagoda name and location.');
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedPagodaId) {
      alert('Please select a pagoda to delete');
      return;
    }
    if (window.confirm('Are you sure you want to delete this pagoda?')) {
      setPagodas(pagodas.filter(pagoda => pagoda.id !== selectedPagodaId));
      setSelectedPagodaId(null);
      alert('Pagoda deleted successfully!');
    }
  };

  const handleEditSelected = () => {
    if (!selectedPagodaId) {
      alert('Please select a pagoda to edit');
      return;
    }
    const pagodaToEdit = pagodas.find(pagoda => pagoda.id === selectedPagodaId);
    if (pagodaToEdit) {
      setSelectedPagodaForEdit(pagodaToEdit);
      setFormData({
        pagodaName: pagodaToEdit.name,
        location: pagodaToEdit.location || '',
        price: pagodaToEdit.price,
        discount: '',
        startDate: pagodaToEdit.bestTimeToVisit || '',
        endDate: '',
        description: pagodaToEdit.descriptionMm || '',
        history: pagodaToEdit.historyMm || '',
        tags: pagodaToEdit.tags || '',
        facilities: '',
        images: pagodaToEdit.images || []
      });
      setImages(pagodaToEdit.images || []);
      setShowEditModal(true);
    }
  };

  const handleConfirmEdit = () => {
    if (selectedPagodaForEdit && formData.pagodaName) {
      const updatedPagodas = pagodas.map(pagoda =>
        pagoda.id === selectedPagodaForEdit.id
          ? {
              ...pagoda,
              name: formData.pagodaName,
              nameEn: formData.pagodaName,
              location: formData.location || pagoda.location,
              locationMm: formData.location || pagoda.location,
              price: formData.price || pagoda.price,
              descriptionMm: formData.description,
              description: formData.description,
              historyMm: formData.history,
              history: formData.history,
              tags: formData.tags,
              bestTimeToVisit: formData.startDate,
              bestTimeToVisitMm: formData.startDate,
              images: formData.images.length > 0 ? formData.images : pagoda.images
            }
          : pagoda
      );
      setPagodas(updatedPagodas);
      setShowEditModal(false);
      setSelectedPagodaId(null);
      setSelectedPagodaForEdit(null);
      setFormData({
        pagodaName: '',
        location: '',
        price: '',
        discount: '',
        startDate: '',
        endDate: '',
        description: '',
        history: '',
        tags: '',
        facilities: '',
        images: []
      });
      setImages([]);
      alert('Pagoda updated successfully!');
    }
  };

  const handleSelectAll = () => {
    if (selectedPagodaId === 'all') {
      setSelectedPagodaId(null);
    } else {
      setSelectedPagodaId('all');
    }
    setShowAllDropdown(false);
  };

  const togglePagodaSelection = (id) => {
    if (selectedPagodaId === id) {
      setSelectedPagodaId(null);
    } else {
      setSelectedPagodaId(id);
    }
  };

  const filteredPagodas = pagodas.filter(pagoda =>
    pagoda.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pagoda.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pagoda.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pagoda.tags && pagoda.tags.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <i key={i} className="bi bi-star-fill" style={{ color: '#ff8a00', fontSize: '12px' }}></i>
        ))}
        {hasHalfStar && <i className="bi bi-star-half" style={{ color: '#ff8a00', fontSize: '12px' }}></i>}
        {[...Array(5 - Math.ceil(rating))].map((_, i) => (
          <i key={i} className="bi bi-star" style={{ color: '#ff8a00', fontSize: '12px' }}></i>
        ))}
      </>
    );
  };

  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <Header title="Bagan Pagodas History Management" onThemeChange={handleThemeChange} />

      {/* Search and Action Buttons Row */}
      <div className="search-actions-row">
        <div className="search-bar-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Search by pagoda name, location or tags..."
            className="search-input-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <button className="action-btn delete-btn" onClick={handleDeleteSelected}>
          <i className="bi bi-trash"></i> Delete
        </button>
        
        <button className="action-btn edit-btn-action" onClick={handleEditSelected}>
          <i className="bi bi-pencil-square"></i> Edit
        </button>
        
        <div className="dropdown-wrapper">
          <button className="action-btn all-btn" onClick={() => setShowAllDropdown(!showAllDropdown)}>
            <i className="bi bi-check-all"></i> All <i className="bi bi-chevron-down"></i>
          </button>
          {showAllDropdown && (
            <div className="dropdown-menu">
              <button onClick={() => { setSelectedPagodaId('all'); setShowAllDropdown(false); }}>Select All</button>
              <button onClick={() => { setSelectedPagodaId(null); setShowAllDropdown(false); }}>Deselect All</button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Add Form (Left) + Pagoda Cards (Right) */}
      <div className="hotels-two-columns">
        {/* Left Column - Add Form with Image Gallery on Top */}
        <div className="add-form-column">
          <div className="add-form-card">
            {/* Image Gallery Section - ON TOP */}
            <div className="image-gallery-top">
              <label className="gallery-label">Pagoda Images Gallery</label>
              <div className="image-gallery-wrapper">
                <div className="image-upload-box">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    id="image-upload-gallery"
                  />
                  <label htmlFor="image-upload-gallery" className="upload-box">
                    <i className="bi bi-plus-lg"></i>
                    <span>Add Image</span>
                  </label>
                </div>
                <div className="image-scroll-container-horizontal">
                  {images.map((img, index) => (
                    <div key={index} className="image-item">
                      <img src={img} alt={`Preview ${index}`} />
                      <button className="remove-image-btn" onClick={() => removeImage(index)}>
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Fields - BELOW Image Gallery */}
            <div className="form-fields-section">
              <div className="add-form-group">
                <label>Pagoda Name (Myanmar) *</label>
                <input
                  type="text"
                  name="pagodaName"
                  placeholder="e.g., အာနန္ဒာဘုရား"
                  value={formData.pagodaName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="add-form-group">
                <label>Location *</label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g., Old Bagan, Mandalay Region"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>

              <div className="add-form-row">
                <div className="add-form-group half">
                  <label>Tags</label>
                  <input
                    type="text"
                    name="tags"
                    placeholder="e.g., Ananda, Bagan, Temple"
                    value={formData.tags}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="add-form-group half">
                  <label>Entry Fee</label>
                  <input
                    type="text"
                    name="price"
                    placeholder="e.g., Free or 5000 MMK"
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="add-form-row">
                <div className="add-form-group half">
                  <label>Best Time to Visit</label>
                  <input
                    type="text"
                    name="startDate"
                    placeholder="e.g., November to February"
                    value={formData.startDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="add-form-group half">
                  <label>Discount (%)</label>
                  <input
                    type="text"
                    name="discount"
                    placeholder="e.g., 20"
                    value={formData.discount}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="add-form-group">
                <label>Short Description (Myanmar)</label>
                <textarea
                  name="description"
                  rows="2"
                  placeholder="Enter a brief description of the pagoda in Myanmar..."
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <div className="add-form-group">
                <label>History (Myanmar)</label>
                <textarea
                  name="history"
                  rows="4"
                  placeholder="Enter the history of the pagoda in Myanmar..."
                  value={formData.history}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <button className="add-item-btn-full" onClick={handleAddPagoda}>
                Add Pagoda
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Pagoda Cards (2 per row) */}
        <div className="hotels-cards-column">
          <div className="hotels-scroll-area">
            <div className="hotels-grid-2cols">
              {filteredPagodas.map((pagoda) => (
                <div 
                  key={pagoda.id} 
                  className={`hotel-card-vertical ${selectedPagodaId === pagoda.id ? 'selected' : ''}`}
                  onClick={() => togglePagodaSelection(pagoda.id)}
                >
                  <div className="hotel-card-image">
                    <div className="image-slider">
                      {pagoda.images[0] && pagoda.images[0].startsWith('data:') ? (
                        <img src={pagoda.images[0]} alt={pagoda.name} />
                      ) : (
                        <div style={{ fontSize: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                          {pagoda.images[0] || '🛕'}
                        </div>
                      )}
                    </div>
                    <div className="selection-check">
                      {selectedPagodaId === pagoda.id && <i className="bi bi-check-circle-fill"></i>}
                    </div>
                  </div>
                  <div className="hotel-card-info">
                    <h3 className="hotel-name">{pagoda.name}</h3>
                    <p className="hotel-location">
                      <i className="bi bi-geo-alt-fill"></i> {pagoda.location}
                    </p>
                    {pagoda.tags && (
                      <div className="pagoda-tags">
                        <i className="bi bi-tag-fill"></i> {pagoda.tags}
                      </div>
                    )}
                    <p className="hotel-price">
                      {pagoda.price === 'Free' ? pagoda.price : `Entry: ${pagoda.price}`}
                    </p>
                    {pagoda.bestTimeToVisit && (
                      <p className="best-time">
                        <i className="bi bi-calendar-check"></i> Best Time: {pagoda.bestTimeToVisit}
                      </p>
                    )}
                    <div className="hotel-rating">
                      {renderStars(pagoda.rating)}
                      <span className="rating-count">({pagoda.reviews} reviews)</span>
                    </div>
                    {pagoda.descriptionMm && (
                      <p className="pagoda-description">
                        {pagoda.descriptionMm.length > 80 ? `${pagoda.descriptionMm.substring(0, 80)}...` : pagoda.descriptionMm}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Pagoda Information</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Pagoda Name (Myanmar)</label>
                <input
                  type="text"
                  name="pagodaName"
                  value={formData.pagodaName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Tags</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Entry Fee</label>
                  <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Best Time to Visit</label>
                  <input
                    type="text"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Discount (%)</label>
                  <input
                    type="text"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Short Description (Myanmar)</label>
                <textarea
                  name="description"
                  rows="2"
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              <div className="form-group">
                <label>History (Myanmar)</label>
                <textarea
                  name="history"
                  rows="4"
                  value={formData.history}
                  onChange={handleInputChange}
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button className="discard-btn" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="add-item-btn" onClick={handleConfirmEdit}>
                Confirm Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HistoryOfPagodas;