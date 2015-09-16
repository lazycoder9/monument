'use strict';

const assert = require('chai').assert
    , parseUrl = require('./url')
    , host = 'thehost'
    , port = '9090'
    , path = '/path1/path2/'
    , urlStr = 'http://' + host + ':' + port + path

    , validateStuffMoney1000 = (query) => {
        assert.isDefined(query.stuff, '"stuff" should be defined on the query object');
        assert.isArray(query.stuff, '"stuff" should be an array');
        assert.isUndefined(query['stuff[]'], '"stuff[]" should not be defined on the query object');
        assert.lengthOf(query.stuff, 2,'should be a two element array: ' + query);
        assert.equal(JSON.stringify(query.stuff), JSON.stringify(['money','1000']), 'query param value of "stuff" got dorked');
    };

describe('parseUrl', () => {

  it('should return a parse function', () => {
    assert.isFunction(parseUrl);
  });

  describe('parse Tests', () => {

    it('should behave itself without request parameters', () => {
        const query = parseUrl(urlStr).query;

        assert.isObject(query);
        assert.strictEqual(Object.keys(query).length, 0, 'expected an empty query object: ' + parseUrl(urlStr));
    });

    it('should not dork with single value query parms that don\'t have square brackets', () => {
        const  thisValue = 'money'
            , queryStr = '?stuff=' + thisValue
            , query = parseUrl(urlStr + queryStr).query;

        assert.strictEqual(query.stuff, thisValue,'query param value of "stuff" got dorked');
    });

    it('should combine query params and remove square brackets', () => {
        const queryStr = '?stuff[]=money&stuff[]=1000';

        validateStuffMoney1000(parseUrl(urlStr + queryStr).query);
    });

    it('should create a single element array even when only a single value exists', () => {
        const queryStr = '?stuff[]=money'
            , query = parseUrl(urlStr + queryStr).query;

        assert.isDefined(query.stuff, '"stuff" should be defined on the query object');
        assert.isArray(query.stuff, '"stuff" should be an array even though only one value was present, because of the deliberate square brackets');
        assert.isUndefined(query['stuff[]'], '"stuff[]" should not be defined on the query object');
        assert.strictEqual(query.stuff[0], 'money', 'query param of "stuff" got dorked');
        assert.lengthOf(query.stuff, 1, 'should be a single element array');
    });

    it('should remove square brackets on a single parm with a comma delimited value', () =>  {
        // NOTE: comma delimited values are not parsed into an array!
        const queryStr = '?stuff[]=one,two,three'
            , query = parseUrl(urlStr + queryStr).query;

        assert.isDefined(query.stuff, '"stuff" should be defined on the query object');
        assert.isArray(query.stuff, '"stuff" should be an array');
        assert.isUndefined(query['stuff[]'], '"stuff[]" should not be defined on the query object');
        assert.lengthOf(query.stuff,1,'should be a single element array: ' + query);
        assert.equal(JSON.stringify(query.stuff), JSON.stringify(['one,two,three']), 'query param value of "stuff" got dorked');
    });

    it('should combine query parms that are not using square brackets', () => {
        const queryStr = '?stuff=money&stuff=1000';

        validateStuffMoney1000(parseUrl(urlStr + queryStr).query);
    });

    it('should combine query parms that inconsistently use [] convention with [] last', () => {
        const queryStr = '?stuff=money&stuff[]=1000';

        validateStuffMoney1000(parseUrl(urlStr + queryStr).query);
    });

    it('should combine query parms that inconsistently use [] convention with [] first', () => {
        const queryStr = '?stuff[]=money&stuff=1000';

        validateStuffMoney1000(parseUrl(urlStr + queryStr).query);
    });

    it('should combine multiple query parms that use comma delimited values', () => {
        const queryStr = '?stuff=one,two,three&stuff=four,five,six&stuff=seven,eight,nine,ten'
            , query = parseUrl(urlStr + queryStr).query;

        assert.isDefined(query.stuff, '"stuff" should be defined on the query object');
        assert.isArray(query.stuff, '"stuff" should be an array');
        assert.isUndefined(query['stuff[]'], '"stuff[]" should not be defined on the query object');
        assert.lengthOf(query.stuff,3,'should be a three element array: ' + query);
        assert.equal(JSON.stringify(query.stuff), JSON.stringify(['one,two,three','four,five,six','seven,eight,nine,ten']), 'query param value of "stuff" got dorked');
    });
  });
});
