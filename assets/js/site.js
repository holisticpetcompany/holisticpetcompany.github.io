---
---

// Mailchimp ajax submit based on ajaxchimp by Siddharth Doshi
(function ($) {
  'use strict';

  $.fn.mcajax = function (options) {
    var form = this;

    // Collect required fields
    var reqd = form.find('.required');
    var email = form.find('input[type=email]');
    var label = form.find('label[for=' + email.attr('id') + ']');

    var settings = $.extend({
      'url': form.attr('action')
    }, options);
    var url = settings.url.replace('/post?', '/post-json?').concat('&c=?');

    form.attr('novalidate', 'true');
    email.attr('name', 'EMAIL');

    form.submit(function () {
      form.find('#mc-submitting').hide();
      form.find('.required').hide();
      form.find('#mc-email-error').hide();
      form.find('#mc-submit-error').hide();
      form.find('#mc-response-error').hide();

      function successCallback(resp) {
        form.find('#mc-submitting').hide();
        form.find('.required').removeClass('has-error');
        form.find('#mc-email-error').hide();
        form.find('#mc-submit-error').hide();
        form.find('#mc-response-error').hide();
        if (resp.result === 'success') {
          form.find('#mc-email-success').show();
          form.find('#mc-submit').hide();
        } else {
          var index = -1;
          var msg;
          try {
            var parts = resp.msg.split(' - ', 2);
            if (parts[1] === undefined) {
              msg = resp.msg;
            } else {
              var i = parseInt(parts[0], 10);
              if (i.toString() === parts[0]) {
                index = parts[0];
                msg = parts[1];
              } else {
                index = -1;
                msg = resp.msg;
              }
            }
          }
          catch (e) {
            index = -1;
            msg = resp.msg;
          }
          form.find('#mc-response-error #mc-response').html('<p>' + msg + '</p>');
          form.find('#mc-response-error').show();
          form.find('input#mc-email').focus();
        }
      }

      if (form.find('input#mc-email').val() == "") {
        form.find('#mc-email-error').show();
        form.find('input#mc-email').parent().addClass('has-error');
        form.find('input#mc-email').focus();
        return false;
      }

      form.find('#mc-submitting').show();

      var data = {};
      var dataArray = form.serializeArray();
      $.each(dataArray, function (index, item) {
        data[item.name] = item.value;
      });

      $.ajax({
        url: url,
        data: data,
        success: successCallback,
        dataType: 'jsonp',
        error: function (resp, text) {
          form.find('#mc-submitting').hide();
          form.find('#mc-submit-error').show();
          console.log('ajax submit error: ' + text);
        }
      });
      return false;
    });
    return this;
  };
})(jQuery);


$('#mc-form').mcajax({
  url: "http://holisticpetcompany.us7.list-manage.com/subscribe/post-json?u=bf68a010400f78efe058f254d&amp;id=704394e54f"
});


// Initialise simpleCart
simpleCart({
  cartColumns: [
    { attr: "name",       label: "Name" },
    { attr: "price",      label: "Price",     view: 'currency' },
    { view: "decrement",  label: false,       text: '<i class="fa fa-minus"></i>' },
    { attr: "quantity",   label: "Qty" },
    { view: "increment",  label: false,       text: '<i class="fa fa-plus"></i>' },
    { attr: "total",      label: "SubTotal",  view: 'currency' },
    { view: "remove",     label: false,       text: '<i class="fa fa-trash-o"></i>' }
  ],
  cartStyle: "table",
  checkout: {
    type:    "PayPal",
    method:  "GET",
    email:   "{{ site.payments }}",
    success: "{{ site.url }}/products/order-success.html",
    cancel:  "{{ site.url }}/products/order-cancel.html",
    sandbox: false
  },
  currency: "GBP",
});

var simpleCart_oldfn_writeCart = simpleCart.writeCart;
simpleCart.writeCart = function (selector) {
  // Run the simpleCart implementation
  var cart_container = simpleCart_oldfn_writeCart(selector);
  cart_container.addClass('table');

  // Build the footer
  var footer_container = simpleCart.$create('tfoot');
  var footer_row1 = simpleCart.$create('tr').addClass('footerRow');
  footer_row1.append(simpleCart.$create('td').html('P&P'));
  //footer_row1.append(simpleCart.$create('td').html(simpleCart.toCurrency(simpleCart.shipping())));
  footer_row1.append(simpleCart.$create('td'));
  footer_row1.append(simpleCart.$create('td'));
  footer_row1.append(simpleCart.$create('td'));
  footer_row1.append(simpleCart.$create('td'));
  footer_row1.append(simpleCart.$create('td').html(simpleCart.toCurrency(simpleCart.shipping())));
  footer_row1.append(simpleCart.$create('td'));
  var footer_row2 = simpleCart.$create('tr').addClass('footerRow').addClass('total');
  footer_row2.append(simpleCart.$create('td').html('Total'));
  footer_row2.append(simpleCart.$create('td'));
  footer_row2.append(simpleCart.$create('td'));
  footer_row2.append(simpleCart.$create('td'));
  footer_row2.append(simpleCart.$create('td'));
  footer_row2.append(simpleCart.$create('td').html(simpleCart.toCurrency(simpleCart.grandTotal())));
  footer_row2.append(simpleCart.$create('td'));
  footer_container.append(footer_row1).append(footer_row2);

  // Add footer to table
  cart_container.el.find('thead').after(footer_container.el);

  return cart_container;
}

simpleCart.validateChange = function(type, quantity) {
  switch (type) {
{% for product in site.shop.products %}
  case '{{ product[0] }}':
    if (simpleCart.getCountByType('{{ product[0] }}') + quantity <= {{ product[1].max }}) {
      return true;
    }
    break;
{% endfor %}
  }
  return false;
}

simpleCart.getCountByType = function(type) {
  var count = 0;
  simpleCart.each(function(item) {
    if (item.get('type') == type) {
      count += item.quantity();
    }
  });
  return count;
}

simpleCart.bind('beforeAdd', function(item) {
  switch (item.get('type')) {
{% for product in site.shop.products %}
  case '{{ product[0] }}':
    if (simpleCart.getCountByType('{{ product[0] }}') + item.quantity() <= {{ product[1].max }}) {
      return true;
    }
    break;
{% endfor %}
  }
  var label = $('.simpleCart_shelfItem_group .item_name:contains('+item.get('name')+')').parents('.simpleCart_shelfItem_group').find('.label.item_not_added');
  label.removeAttr('hidden').show().delay(8000).fadeOut();
  return false;
});

simpleCart.Item._.increment = function(amount) {
  var diff = amount || 1;
  diff = parseInt(diff, 10);
  if (simpleCart.validateChange(this.get('type'), diff)) {
    this.quantity(this.quantity() + diff);
  }
  if (this.quantity() < 1) {
    this.remove();
    return null;
  }
  return this;
}

simpleCart.shipping(function() {
  var cost = 0;
  if (simpleCart.quantity() > 0) {
    cost += {{ site.shop.shipping }};
  }
{% for product in site.shop.products %}
  p = simpleCart.find({ type: '{{ product[0] }}' });
  pc = 0;
  for (i = 0 ; i < p.length ; i++) {
    pc += p[i].quantity() * {{ product[1].shipping }};
  }
  cost += Math.min(pc, {{ product[1].shipping_max }});
{% endfor %}
  return cost;
});

simpleCart.bind('afterAdd', function(item) {
  console.log(item.get('name'));
  var label = $('.simpleCart_shelfItem_group .item_name:contains('+item.get('name')+')').parents('.simpleCart_shelfItem_group').find('.label.item_added');
  label.removeAttr('hidden').show().delay(1000).fadeOut();
});

