/* ==========================================================================
   LOVELACE'D Product Customizer — 5-Step Guided Flow
   ========================================================================== */

(function () {
  'use strict';

  var form = document.querySelector('[data-customizer-form]');
  if (!form) return;

  var currentStep = 1;
  var totalSteps = 5;
  var photoDataURL = null;
  var photoFile = null;

  /* ---------- Elements ---------- */
  var panels = form.querySelectorAll('[data-step]');
  var indicators = document.querySelectorAll('[data-step-indicator]');
  var nextBtns = form.querySelectorAll('[data-next-step]');
  var prevBtns = form.querySelectorAll('[data-prev-step]');
  var addToCartBtn = form.querySelector('[data-add-to-cart-btn]');

  // Photo
  var dropzone = form.querySelector('[data-dropzone]');
  var photoInput = form.querySelector('[data-photo-input]');
  var previewImg = form.querySelector('[data-preview-img]');
  var previewName = form.querySelector('[data-preview-name]');
  var photoWarning = form.querySelector('[data-photo-warning]');

  // Details
  var detailToggles = form.querySelectorAll('[data-detail-toggle]');

  // Review
  var reviewFrontImg = form.querySelector('[data-review-front-img]');
  var reviewDesign = form.querySelector('[data-review-design]');
  var reviewDetails = form.querySelector('[data-review-details]');
  var termsCheckbox = form.querySelector('[data-terms-checkbox]');
  var consentCheckbox = form.querySelector('[data-consent-checkbox]');

  // Hidden fields
  var hiddenDesign = form.querySelector('[data-hidden-design]');
  var hiddenSize = form.querySelector('[data-hidden-size]');

  /* ---------- Step Navigation ---------- */
  function goToStep(step) {
    if (step < 1 || step > totalSteps) return;
    currentStep = step;

    panels.forEach(function (panel) {
      var panelStep = parseInt(panel.getAttribute('data-step'), 10);
      panel.classList.toggle('is-active', panelStep === currentStep);
    });

    indicators.forEach(function (ind) {
      var indStep = parseInt(ind.getAttribute('data-step-indicator'), 10);
      ind.classList.remove('is-active', 'is-complete');
      if (indStep === currentStep) {
        ind.classList.add('is-active');
      } else if (indStep < currentStep) {
        ind.classList.add('is-complete');
      }
    });

    if (currentStep === 5) {
      buildReview();
    }

    // Scroll to customizer top
    var section = document.getElementById('product-customizer');
    if (section) {
      var headerHeight = 70;
      var top = section.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }
  }

  nextBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (validateStep(currentStep)) {
        goToStep(currentStep + 1);
      }
    });
  });

  prevBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      goToStep(currentStep - 1);
    });
  });

  /* ---------- Step Validation ---------- */
  function validateStep(step) {
    switch (step) {
      case 1:
        var selectedSize = form.querySelector('input[name="variant_id"]:checked');
        return !!selectedSize;
      case 2:
        var selectedDesign = form.querySelector('input[name="design_preset"]:checked');
        return !!selectedDesign;
      case 3:
        if (!photoFile) {
          if (dropzone) dropzone.style.borderColor = '#C9584C';
          return false;
        }
        return true;
      case 4:
        return true; // Details are optional
      case 5:
        return true;
      default:
        return true;
    }
  }

  /* ---------- Photo Upload ---------- */
  if (photoInput) {
    photoInput.addEventListener('change', function () {
      handleFileSelect(this.files);
    });
  }

  if (dropzone) {
    dropzone.addEventListener('dragover', function (e) {
      e.preventDefault();
      dropzone.classList.add('is-dragover');
    });

    dropzone.addEventListener('dragleave', function () {
      dropzone.classList.remove('is-dragover');
    });

    dropzone.addEventListener('drop', function (e) {
      e.preventDefault();
      dropzone.classList.remove('is-dragover');
      handleFileSelect(e.dataTransfer.files);
    });
  }

  function handleFileSelect(files) {
    if (!files || files.length === 0) return;

    var file = files[0];
    var validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (validTypes.indexOf(file.type) === -1) return;

    photoFile = file;

    var reader = new FileReader();
    reader.onload = function (e) {
      photoDataURL = e.target.result;

      if (previewImg) previewImg.src = photoDataURL;
      if (previewName) previewName.textContent = file.name;
      if (dropzone) {
        dropzone.classList.add('has-file');
        dropzone.style.borderColor = '';
      }

      // Check resolution
      var img = new Image();
      img.onload = function () {
        if (photoWarning) {
          photoWarning.classList.toggle('is-visible', img.width < 600 || img.height < 600);
        }
      };
      img.src = photoDataURL;
    };
    reader.readAsDataURL(file);
  }

  /* ---------- Detail Toggle Switches ---------- */
  detailToggles.forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      var field = toggle.closest('[data-detail-field]');
      if (!field) return;

      var isActive = field.classList.toggle('is-active');
      toggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');

      var input = field.querySelector('[data-detail-input]');
      if (input) {
        if (!isActive) {
          input.value = '';
        } else {
          input.focus();
        }
      }
    });
  });

  /* ---------- Review Builder ---------- */
  function buildReview() {
    // Front preview
    if (reviewFrontImg && photoDataURL) {
      reviewFrontImg.src = photoDataURL;
    }

    // Design name
    var designRadio = form.querySelector('input[name="design_preset"]:checked');
    if (reviewDesign && designRadio) {
      reviewDesign.textContent = designRadio.value;
    }

    // Details preview
    if (reviewDetails) {
      var html = '';
      var fields = form.querySelectorAll('[data-detail-field].is-active');
      fields.forEach(function (field) {
        var input = field.querySelector('[data-detail-input]');
        if (input && input.value.trim()) {
          var label = field.getAttribute('data-detail-field');
          html += '<p><strong>' + escapeHtml(label) + ':</strong> ' + escapeHtml(input.value) + '</p>';
        }
      });
      reviewDetails.innerHTML = html || '<p style="opacity:0.5">No details added</p>';
    }

    // Update hidden fields
    if (hiddenDesign && designRadio) {
      hiddenDesign.value = designRadio.value;
    }

    var sizeRadio = form.querySelector('input[name="variant_id"]:checked');
    if (hiddenSize && sizeRadio) {
      hiddenSize.value = sizeRadio.getAttribute('data-variant-title') || sizeRadio.value;
    }

    updateAddToCartState();
  }

  /* ---------- Checkbox validation for Add to Cart ---------- */
  function updateAddToCartState() {
    if (!addToCartBtn || !termsCheckbox || !consentCheckbox) return;
    addToCartBtn.disabled = !(termsCheckbox.checked && consentCheckbox.checked);
  }

  if (termsCheckbox) termsCheckbox.addEventListener('change', updateAddToCartState);
  if (consentCheckbox) consentCheckbox.addEventListener('change', updateAddToCartState);

  /* ---------- Form Submission (Add to Cart) ---------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!termsCheckbox || !termsCheckbox.checked || !consentCheckbox || !consentCheckbox.checked) return;

    var variantId = form.querySelector('input[name="variant_id"]:checked');
    if (!variantId || !variantId.value) {
      alert('Please select a product size.');
      return;
    }

    // Build properties
    var properties = {};

    // Design preset
    var design = form.querySelector('input[name="design_preset"]:checked');
    if (design) properties['Design Preset'] = design.value;

    // Size label
    if (variantId.getAttribute('data-variant-title')) {
      properties['Size'] = variantId.getAttribute('data-variant-title');
    }

    // Contact details
    var activeFields = form.querySelectorAll('[data-detail-field].is-active');
    activeFields.forEach(function (field) {
      var input = field.querySelector('[data-detail-input]');
      if (input && input.value.trim()) {
        var fieldName = field.getAttribute('data-detail-field');
        properties[fieldName] = input.value.trim();
      }
    });

    // Build the request body
    var body = {
      items: [{
        id: parseInt(variantId.value, 10),
        quantity: 1,
        properties: properties
      }]
    };

    // If we have a photo, we need to handle the upload
    // Shopify supports file uploads through line item properties via form submission
    // For AJAX, we'll encode the photo data and include a reference
    if (photoFile) {
      // Use FormData approach for file upload
      var formData = new FormData();
      formData.append('items[][id]', parseInt(variantId.value, 10));
      formData.append('items[][quantity]', 1);

      Object.keys(properties).forEach(function (key) {
        formData.append('items[][properties][' + key + ']', properties[key]);
      });

      formData.append('items[][properties][_Photo]', photoFile);

      addToCartBtn.disabled = true;
      addToCartBtn.textContent = 'Adding…';

      fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      })
      .then(function (response) {
        if (!response.ok) {
          // Fallback: try JSON method without file
          return addToCartJSON(body);
        }
        return response.json();
      })
      .then(function () {
        window.location.href = '/cart';
      })
      .catch(function () {
        // Final fallback: add without photo as file, include filename as property
        properties['Photo Filename'] = photoFile.name;
        properties['Photo Note'] = 'Customer uploaded a photo (' + photoFile.name + '). Please contact customer for the file if not attached.';
        body.items[0].properties = properties;
        return addToCartJSON(body);
      });
    } else {
      addToCartJSON(body);
    }
  });

  function addToCartJSON(body) {
    addToCartBtn.disabled = true;
    addToCartBtn.textContent = 'Adding…';

    return fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    .then(function (response) {
      return response.json();
    })
    .then(function () {
      window.location.href = '/cart';
    })
    .catch(function () {
      addToCartBtn.disabled = false;
      addToCartBtn.textContent = 'Add to Cart';
      alert('There was an error adding to cart. Please try again.');
    });
  }

  /* ---------- Helpers ---------- */
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }
})();
