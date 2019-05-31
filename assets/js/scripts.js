(function (window, $, undefined) {

	$(document).ready(function () {

		// Select2 Enhancement if it exists
		if ($().select2) {
			var wc_address_book_select_select2 = function () {
				$('select#shipping_address:visible, select#address_book:visible').each(function () {
					$(this).select2();
				});
			};

			wc_address_book_select_select2();
		}

		/*
		 * AJAX call to delete address books.
		 */
		$('.address_book .wc-address-book-delete').click(function (e) {

			e.preventDefault();

			$(this).closest('.wc-address-book-address').addClass('blockUI blockOverlay wc-updating');

			var name = $(this).attr('id');
			var type = $(this).data('type');

			$.ajax({
				url: wc_address_book.ajax_url,
				type: 'post',
				data: {
					action: 'wc_address_book_delete',
					name: name,
					type: type
				},
				success: function (response) {
					$('.wc-updating').remove();
				}
			});
		});

		/*
		 * AJAX call to switch address to primary.
		 */
		$('.address_book .wc-address-book-make-primary').click(function (e) {

			e.preventDefault();

			var name = $(this).attr('id');
			var type = $(this).data('type');
			var primary_address = $('.thc-account-content .woocommerce-Address address');
			var alt_address = $(this).parent().siblings('address');

			// Swap HTML values for address and label
			var pa_html = primary_address.html();
			var aa_html = alt_address.html();

			alt_address.html(pa_html);
			primary_address.html(aa_html);

			primary_address.addClass('blockUI blockOverlay wc-updating');
			alt_address.addClass('blockUI blockOverlay wc-updating');

			$.ajax({
				url: wc_address_book.ajax_url,
				type: 'post',
				data: {
					action: 'wc_address_book_make_primary',
					name: name,
					type: type
				},
				success: function (response) {
					$('.wc-updating').removeClass('blockUI blockOverlay wc-updating');
				}
			});
		});

		/*
		 * AJAX call display address on checkout when selected.
		 */
		function address_book_checkout_field_prepop(type) {

			var that = $('#'+type+'_address_book_field #'+type+'_address_book');
			var name = $(that).val();

			if (name !== undefined) {

				if ('add_new' == name) {

					// Clear values when adding a new address.
					if(type === 'billing') {
						$('.thcommerce-billing-fields input').not($('#'+type+'_country')).each(function () {
							$(this).val('');
						});
					} else if(type === 'shipping') {
						$('.'+type+'_address input').not($('#'+type+'_country')).each(function () {
							$(this).val('');
						});
					}

					// Set Country Dropdown.
					// Don't reset the value if only one country is available to choose.
					if (typeof $('#'+type+'_country').attr('readonly') == 'undefined') {
						$('#'+type+'_country').val('').change();
						$('#'+type+'_country_chosen').find('span').html('');
					}

					// Set state dropdown.
					$('#'+type+'_state').val('').change();
					$('#'+type+'_state_chosen').find('span').html('');

					return;
				}

				if (name.length > 0) {

					$(that).closest('.'+type+'_address').addClass('blockUI blockOverlay wc-updating');

					$.ajax({
						url: wc_address_book.ajax_url,
						type: 'post',
						data: {
							action: 'wc_address_book_checkout_update',
							name: name,
							type: type
						},
						dataType: 'json',
						success: function (response) {

							// Loop through all fields incase there are custom ones.
							Object.keys(response).forEach(function (key) {
								$('#' + key).val(response[key]).change();
							});

							// Set Country Dropdown.

							if(type === 'shipping') {
								$('#shipping_country').val(response.shipping_country).change();
								$('#shipping_country_chosen').find('span').html(response.shipping_country_text);

								// Set state dropdown.
								$('#shipping_state').val(response.shipping_state);
								var stateName = $('#shipping_state option[value="' + response.shipping_state + '"]').text();
							} else if(type === 'billing') {
								$('#billing_country').val(response.billing_country).change();
								$('#billing_country_chosen').find('span').html(response.billing_country_text);

								// Set state dropdown.
								$('#billing_state').val(response.billing_state);
								var stateName = $('#billing_state option[value="' + response.billing_state + '"]').text();
							}

							$("#s2id_"+type+"_state").find('.select2-chosen').html(stateName).parent().removeClass('select2-default');

							// Remove loading screen.
							$('.'+type+'_address').removeClass('blockUI blockOverlay wc-updating');

						}
					});

				}
			}
		}

		address_book_checkout_field_prepop('shipping');
		address_book_checkout_field_prepop('billing');

		$('#shipping_address_book_field #shipping_address_book').change(function () {
			address_book_checkout_field_prepop('shipping');
		});

		$('#billing_address_book_field #billing_address_book').change(function () {
			address_book_checkout_field_prepop('billing');
		});

	});

})(window, jQuery);
