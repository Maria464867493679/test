describe('Тестирование https://coffee-cart.app/', () => {
  // Перед каждым тестом посещаем главную страницу
  beforeEach(() => {
    cy.visit('https://coffee-cart.app/');
  });

  // Проверяем, добавляется ли товар в корзину
  it('Добавляется ли товар в корзину', () => {
    // Кликаем по первому товару, чтобы добавить его в корзину
    cy.get('.cup').first().click();
    // Проверяем, что в корзине отображается один товар
    cy.get(':nth-child(2) > a').should('have.text', 'cart (1)');
  });

  // Проверяем, правильно ли подсчитывается итоговая сумма в корзине
  it('Правильная ли сумма подсчитывается в Total после добавления товара', () => {
    // Извлекаем цену первого кофе
    cy.get('li small').first().invoke('text').then((text) => {
        const valueWithoutDollar = text.replace('$', '').trim();
        const price = parseFloat(valueWithoutDollar);
        cy.wrap(price).as('price'); // Алиас
      });

    // Добавляем этот кофе в корзину
    cy.get('li .cup').first().click();

    // Извлекаем итоговую сумму из корзины
    cy.get('[data-test="checkout"]').invoke('text').then((text) => {
        const total = parseFloat(text.replace('Total: $', '').trim());
        cy.wrap(total).as('total');
      });

    // Сравниваем цену кофе и итоговую сумму
    cy.get('@price').then((price) => {
      cy.get('@total').then((total) => {
        expect(price).to.eq(total);
      });
    });
  });

  // Проверяем акцию "Lucky Day" после добавления трёх товаров
  it('Появляется ли акция Lucky Day после добавления трёх товаров', () => {
    // Кликаем по первым трём товарам
    cy.get('li .cup').each(($el, index) => {
      if (index < 3) {
        cy.wrap($el).click();
      }
    });

    // Проверяем, что акция отображается
    cy.get('.promo').should('be.visible');
  });

  // Проверяем процесс покупки товара
  it('Покупается ли товар', () => {
    // Добавляем товар в корзину и переходим к оформлению покупки
    cy.get('.cup').first().click();
    cy.get('[data-test="checkout"]').click();
    // Заполняем форму покупки
    cy.get('#name').type('Мария Иванова');
    cy.get('#email').type('maria.ivanova@gmail.com');
    cy.get('[aria-label="Promotion agreement"]').click();
    cy.get('#submit-payment').click();
    // Проверяем, что покупка успешно завершена
    cy.get('.snackbar').should('be.visible');
  });

  // Проверяем, удаляется ли товар из корзины
  it('Удаляется ли товар из корзины', () => {
    // Добавляем товар в корзину и переходим в неё
    cy.get('.cup').first().click();
    cy.get(':nth-child(2) > a').click();
    // Удаляем товар из корзины
    cy.get('.delete').click();
    // Проверяем, что корзина пуста
    cy.get('p').should('have.text', 'No coffee, go add some.');
  });

  // Проверяем изменение счётчика товара в корзине
  it('Изменяется ли счётчик товара в корзине', () => {
    // Добавляем товар в корзину и увеличиваем его количество
    cy.get('.cup').first().click();
    cy.get(':nth-child(2) > a').click();
    cy.get(':nth-child(2) > .unit-controller > [aria-label="Add one Espresso"]').click();
    // Проверяем, что количество товара обновилось
    cy.get(':nth-child(2) > .unit-desc').invoke('text').then((text) => {
        expect(text.replace(/[$]\d+\.\d+\s*/, '').trim()).to.equal('x 2');
      });
    // Уменьшаем количество товара и проверяем, что корзина пуста
    cy.get(':nth-child(2) > .unit-controller > [aria-label="Remove one Espresso"]').click();
    cy.get(':nth-child(2) > .unit-controller > [aria-label="Remove one Espresso"]').click();
    cy.get('p').should('have.text', 'No coffee, go add some.');
  });
});
