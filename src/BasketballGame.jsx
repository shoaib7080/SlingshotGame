import React, { useRef, useEffect, useState } from "react";

const BasketballGame = () => {
  const canvasRef = useRef(null);
  const ballRef = useRef(null);
  const [isWin, setIsWin] = useState(false);
  const isWinRef = useRef(false);

  const gravity = 0.4;
  const launchPower = 0.3;

  const resetBall = () => {
    if (ballRef.current) {
      ballRef.current.x = 100;
      ballRef.current.y = canvasRef.current.height - 120;
      ballRef.current.vx = 0;
      ballRef.current.vy = 0;
      ballRef.current.isMoving = false;
      ballRef.current.isDragging = false;
      ballRef.current.hasScored = false;
    }
    window.location.reload();
  };

  useEffect(() => {
    let gameRunning = false;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = 800;
    canvas.height = 650;

    const ballImage = new Image();
    const basketImage = new Image();
    const backgroundImage = new Image();

    ballImage.src = "/assets/basketball.svg";
    basketImage.src = "/assets/basket.svg";
    backgroundImage.src = "/assets/crowd.jpg";

    let imagesLoaded = 0;
    const totalImages = 3;

    const onImageLoad = () => {
      imagesLoaded++;
      if (imagesLoaded === totalImages) {
        startGame();
      }
    };

    ballImage.onload = onImageLoad;
    basketImage.onload = onImageLoad;
    backgroundImage.onload = onImageLoad;

    const startGame = () => {
      if (gameRunning) return;
      gameRunning = true;

      let showWinAnimation = false;

      const ball = {
        x: 100,
        y: canvas.height - 120,
        radius: 15,
        vx: 0,
        vy: 0,
        isDragging: false,
        isMoving: false,
        hasScored: false,
      };

      ballRef.current = ball;

      const basket = {
        x: canvas.width - 120,
        y: canvas.height / 2,
        width: 60,
        height: 40,
      };

      let dragStart = { x: 0, y: 0 };
      let prevX = ball.x;
      let prevY = ball.y;
      let animationTime = 0;

      const drawBall = () => {
        ctx.drawImage(
          ballImage,
          ball.x - ball.radius,
          ball.y - ball.radius,
          ball.radius * 2,
          ball.radius * 2
        );
      };

      const drawBasket = () => {
        ctx.drawImage(
          basketImage,
          basket.x,
          basket.y,
          basket.width,
          basket.height
        );
      };

      const drawTrajectory = (dx, dy) => {
        let simX = ball.x;
        let simY = ball.y;
        let vx = dx * launchPower;
        let vy = dy * launchPower;

        const maxPoints = 20;

        for (let i = 0; i < maxPoints; i++) {
          vy += gravity;
          simX += vx;
          simY += vy;

          const opacity = 0.8 - (i / maxPoints) * 0.7;

          ctx.beginPath();
          ctx.arc(simX, simY, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(248, 61, 61, ${opacity})`;
          ctx.fill();
        }
      };

      const drawWinAnimation = () => {
        animationTime += 0.1;

        // Confetti effect
        for (let i = 0; i < 20; i++) {
          const x = Math.random() * canvas.width;
          const y = (animationTime * 50 + i * 30) % canvas.height;
          const hue = Math.random() * 360;

          ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
          ctx.fillRect(x, y, 8, 8);
        }

        // Win text
        ctx.fillStyle = "gold";
        ctx.font = "48px Arial";
        ctx.textAlign = "center";
        const bounce = Math.sin(animationTime) * 10;
        ctx.fillText("GOAL!", canvas.width / 2, canvas.height / 2 + bounce);

        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.fillText(
          "🎉 Amazing Shot! 🎉",
          canvas.width / 2,
          canvas.height / 2 + 50 + bounce
        );
        ctx.textAlign = "left";
      };

      const resetBallInternal = () => {
        ball.x = 100;
        ball.y = canvas.height - 120;
        ball.vx = 0;
        ball.vy = 0;
        ball.isMoving = false;
        ball.hasScored = false;
      };

      const update = () => {
        if (ball.isMoving) {
          prevX = ball.x;
          prevY = ball.y;

          ball.vy += gravity;
          ball.vx *= 0.99;
          ball.vy *= 0.99;
          ball.x += ball.vx;
          ball.y += ball.vy;

          if (
            ball.x > basket.x &&
            ball.x < basket.x + basket.width &&
            ball.y > basket.y &&
            ball.y < basket.y + basket.height &&
            ball.vy > 0 &&
            prevY < basket.y &&
            !ball.hasScored
          ) {
            console.log("BASKET MADE!");
            ball.hasScored = true;
            ball.isMoving = false;
            showWinAnimation = true;
            animationTime = 0;
          }

          if (ball.y + ball.radius > canvas.height) {
            resetBallInternal();
          }
        }
      };

      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Gradually transition background size
        const targetSize = showWinAnimation ? 1.25 : 1; // Target scale
        const currentScale = showWinAnimation
          ? 1 + 0.25 * Math.min(animationTime / 2, 1) // Gradually reach 1.25x over 2 seconds
          : 1;

        ctx.globalAlpha = 0.6;
        const crowdHeight = 200 * currentScale;
        const crowdWidth = canvas.width * currentScale;
        const offsetX = (canvas.width - crowdWidth) / 2; // Center the scaled background

        ctx.drawImage(
          backgroundImage,
          offsetX,
          canvas.height - crowdHeight,
          crowdWidth,
          crowdHeight
        );
        ctx.globalAlpha = 1.0;

        ctx.beginPath();
        ctx.arc(100, canvas.height - 120, 20, 0, Math.PI * 2);
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 5;
        ctx.setLineDash([1, 1]);
        ctx.stroke();
        ctx.setLineDash([]);

        drawBasket();
        drawBall();

        if (ball.isDragging) {
          const dx = dragStart.x - ball.x;
          const dy = dragStart.y - ball.y;
          drawTrajectory(dx, dy);
        }

        if (showWinAnimation) {
          drawWinAnimation();
        }
      };

      const loop = () => {
        update();
        draw();
        requestAnimationFrame(loop);
      };

      canvas.addEventListener("mousedown", (e) => {
        if (
          e.offsetX >= ball.x - ball.radius &&
          e.offsetX <= ball.x + ball.radius &&
          e.offsetY >= ball.y - ball.radius &&
          e.offsetY <= ball.y + ball.radius
        ) {
          ball.isDragging = true;
          dragStart = { x: e.offsetX, y: e.offsetY };
        }
      });

      canvas.addEventListener("mousemove", (e) => {
        if (ball.isDragging) {
          ball.x = e.offsetX;
          ball.y = e.offsetY;
        }
      });

      canvas.addEventListener("mouseup", (e) => {
        if (ball.isDragging) {
          const dx = dragStart.x - e.offsetX;
          const dy = dragStart.y - e.offsetY;
          ball.vx = dx * launchPower;
          ball.vy = dy * launchPower;
          ball.isDragging = false;
          ball.isMoving = true;
        }
      });

      loop();
    };
  }, []);

  return (
    <div>
      <canvas
        height={800}
        ref={canvasRef}
        style={{ border: "2px solid black", background: "#ffffffff" }}
      ></canvas>
      <button
        onClick={() => resetBall()}
        style={{ marginTop: "10px", padding: "10px 20px" }}
      >
        Reset Ball
      </button>
    </div>
  );
};

export default BasketballGame;
