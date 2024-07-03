import ParentView from '../views/ParentView.js';//importing code from parent class to child class
//basically to reuse code inside ParentView class

import * as helper from '../helper.js';

class PaginationView extends ParentView
{
  //for pagination buttons, parent Element is 'pagination' container.
  _parentElement = document.querySelector('.pagination');

  //_data contains currentPageNumber for logic
  //_clear() removes earlier page buttons.

  //0.5-->to listener either previous page/next page button was clicked.
  pageBtnClickListener(handler)
  {
    this._parentElement.addEventListener('click',function(e)
    {
      const btn = e.target.closest('.btn--inline');

      if(!btn)
      return;//when clicked outside of buttons

      const goToPage = +(btn.dataset.goto);//string to number
      handler(goToPage);//called ,irrespective of button clicked
    });
  }

  //2.7-->to display page buttons for currentPage
  _generateMarkUp()
  {
    return helper.pageButtonsHTML(this._data);//sending currentPageNumber
  }

  // 2.8-->to clear buttons when error occurs
  handleError()
  {
    this._clear();
  }
}

export default new PaginationView();