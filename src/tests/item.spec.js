const chai = require('chai');
const expect = chai.expect;
// const chaiAsPromised = require('chai-as-promised')
// chai.use(chaiAsPromised);
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const rewire = require('rewire');

const mongoose = require('mongoose');

const sandbox = sinon.createSandbox();

const Item = require('../models/Item.model');

let itemController = rewire('../controllers/item.controller');



describe("/item controllers", () => {

    let findOneStub;
    const sampleUniqueHash = '1234567891';
    let demoItem;

    beforeEach(() => {

        demoItem = {
            name: 'abc',
            rating: 8,
            price: 150,
            hash: sampleUniqueHash
        }

        findOneStub = sandbox.stub(mongoose.Model, 'findOne').resolves(demoItem);

        //console.log(findOneStub)
    })

    afterEach(() => {
        itemController = rewire('../controllers/item.controller');
        sandbox.restore();
    });

    describe('GET /  ', () => {

        it("should return error when no hash is passed", async () => {

            itemController.readItem().then(() => {
                throw new Error("Unexpected success")
            }).catch((e) => {
                expect(e).to.be.an.instanceof(Error);
                expect(e.message).to.equal('Invalid item id');
            });

        })

        it("should pass hash is passed", async () => {
            itemController
                .readItem('someRandomHash')
                .then((item) => {
                    expect(item).to.equal(demoItem);
                })
                .catch((err) => {
                    throw new Error('⚠️ Unexpected failure!');
                });

        })
    })

    describe("PUT / ", () => {
        const newHash = '9192435244';

        let getUniqueHashStub, saveStub, updateVal, result;


        beforeEach(async () => {

            sandbox.restore();

            getUniqueHashStub = sinon.stub().returns(newHash);

            updateVal = {
                ...demoItem,
                hash: newHash
            }

            saveStub = sinon.stub().returns(updateVal);

            findOneStub = sandbox.stub(mongoose.Model, 'findOne').resolves({
                ...demoItem,
                save: saveStub
            });

            itemController.__set__('getUniqueHash', getUniqueHashStub);



        })

        it('should throw invalid argument error', () => {
            itemController.updateItemHash()
                .then(() => {
                    throw new Error('⚠️ Unexpected success!');
                })
                .catch(err => {
                    expect(result).to.be.instanceOf(Error);
                    expect(err.message).to.equal('Incomplete arguments');
                })
        });

        it('should update item hash successfully', async () => {
            result = await itemController.updateItemHash(sampleUniqueHash);
            expect(findOneStub).to.have.been.calledWith({
                hash: sampleUniqueHash
            });
            expect(findOneStub).to.have.been.calledOnce;
            expect(saveStub).to.have.been.calledOnce;
            expect(result).to.equal(updateVal);
        });



    })

    describe('POST /', () => {
        let itemModelStub, saveStub, result;

        beforeEach(async () => {
            saveStub = sandbox.stub().returns(demoItem);
            itemModelStub = sandbox.stub().returns({
                save: saveStub
            });

            itemController.__set__('Item', itemModelStub);
        });

        it('should throw invalid argument error', () => {
            itemController.createItem()
                .then(() => {
                    throw new Error('⚠️ Unexpected success!');
                })
                .catch(err => {
                    expect(result).to.be.instanceOf(Error);
                    expect(err.message).to.equal('Invalid arguments');
                })
        });

        it('should create item successfully', async () => {
            result = await itemController.createItem(demoItem);
            expect(itemModelStub).to.have.been.calledWithNew;
            expect(itemModelStub).to.have.been.calledWith(demoItem);
            expect(saveStub).to.have.been.called;
            expect(result).to.equal(demoItem);
        });
    });

})