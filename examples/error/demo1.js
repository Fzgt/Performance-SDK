function triggerError() {
  console.log(index);
}
document.getElementById('js-btn-error').addEventListener('click', () => {
  //故意输出未赋值的变量
  triggerError();
});

document.getElementById('js-img').setAttribute('src', '404.png');
