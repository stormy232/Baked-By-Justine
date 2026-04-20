<!doctype html>
<?php
session_start();
if(!isset($_SESSION["user"]) || !isset($_SESSION["privilege"])){
  header("Location: login.html");
  exit;
}
?>
<html lang="en">

<head>
<script>
    localStorage.setItem('user_id', <?php echo json_encode($_SESSION["user"]); ?>);
    localStorage.setItem('privilege', <?php echo json_encode($_SESSION["privilege"]); ?>);
</script>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <script type="module" src="./src/main.js"></script>
  <link href="./src/output.css" rel="stylesheet">
  <title>team-1xd3</title>
</head>

<body>
  <div id="app" class="flex bg-[#FAFAF5]">

    <aside id="left-bar" class="sticky top-0 h-screen w-64 bg-[#f3f2ee] border-r border-gray-200 flex flex-col p-4">
      <div class="flex items-center gap-3 px-2 mb-10">
        <div class="bg-[#4a3728] p-2 rounded-lg">
          <i class="fa fa-shopping-basket text-white"></i>
        </div>
        <span class="font-bold text-[#2d2621] text-lg">Bakes By Justine</span>
      </div>
    </aside>

    <div class="flex-1 flex flex-col">
      <div id="top-bar" class="flex flex-row my-2"></div>
      <hr class="opacity-10">
      <div id="content-header" class="flex flex-row my-2 mx-2 justify-end"></div>
      <div id="content" class=""></div>
    </div>
<div 
  id="toast-container" 
  class="fixed bottom-5 right-5 z-[100] flex flex-col gap-3 pointer-events-none"></div>
  </div>
</body>

</html>
