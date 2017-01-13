angular.module('ui.common').factory('DocumentList', ['DocumentObject', (DocumentObject) => {
  
  //private method
  const addDocument = (item) => {
    if (item instanceof DocumentObject) {
      return item;
    }
    else if (_.isObject(item)) {
      return new DocumentObject(item.url, item.apiObject);
    }
    else if (_.isString(item)) {
      return new DocumentObject(item);
    }
  };

  return class DocumentList {
    /**
     * @param list can be list of
     *   string-url, 
     *   {url:, apiObj:} 
     *   DocumentObject
     * Can also be a mix of the above.
     */
    constructor(list, pointer=0) {
      this.list = _.map(list, addDocument) || [];
      this._pointer = parseInt(pointer,10);
    }
    get currentDocumentUrl() {
      return angular.isUndefined(this.list) ?
        undefined :
        this.list[this.pointer].url;
    }
    get currentDocument() {
      return angular.isUndefined(this.list) ?
        undefined :
        this.list[this.pointer];
    }
    set pointer(n) {
      n = parseInt(n, 10);
      if (this.list.length && n >= 0 && n < this.list.length) this._pointer = n;
    }
    get pointer() {
      return this._pointer;
    }
    get size() {
      return this.list.length;
    }
    get progressText() {
      return `${this.pointer + 1}/${this.size}`;
    }
    next() {
      this.pointer += 1;
    }
    prev() {
      this.pointer -= 1;
    }
    add(documents) {
      this.list.push(...documents.map(addDocument));
    }
  };
}]);

angular.module('ui.common').factory('DocumentObject', () => {
  return class DocumentObject {
    constructor(url, apiObject=null) {
      this.url = url;
      this.apiObject = apiObject;
    }
    get isPDF() {
      return (this.url.toLowerCase().indexOf("t=pdf")  >1 || this.fileExtension === '.pdf');
    }
    get fileExtension() {
      const extension = this.url.toLowerCase().match(/\.(pdf|docx?|html|txt)$/g);
      if (extension instanceof Array) return _.last(extension);
      else return undefined;
    }
  };
});